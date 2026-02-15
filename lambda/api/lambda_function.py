import json
import os
import logging
import base64
from datetime import datetime, timedelta, timezone
from decimal import Decimal

import boto3
from boto3.dynamodb.conditions import Key, Attr

logger = logging.getLogger()
logger.setLevel(logging.INFO)

TABLE_NAME = os.environ.get("TABLE_NAME", "sentinel-vulnerabilities")
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME)

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
}


class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            if obj % 1 == 0:
                return int(obj)
            return float(obj)
        return super().default(obj)


def respond(status_code, body):
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body, cls=DecimalEncoder),
    }


def handler(event, context):
    path = event.get("rawPath", "")
    method = event.get("requestContext", {}).get("http", {}).get("method", "GET")
    query = event.get("queryStringParameters") or {}
    path_params = event.get("pathParameters") or {}

    logger.info(f"Request: {method} {path}")

    if method == "OPTIONS":
        return respond(200, {})

    try:
        if path == "/api/vulnerabilities/search":
            return handle_search(query)
        elif path == "/api/vulnerabilities/top10":
            return handle_top10()
        elif path == "/api/stats":
            return handle_stats()
        elif path == "/api/trends":
            return handle_trends()
        elif path == "/api/vulnerabilities" and not path_params.get("cveId"):
            return handle_list(query)
        elif path_params.get("cveId"):
            return handle_detail(path_params["cveId"])
        else:
            return respond(404, {"error": "Not found"})
    except Exception as e:
        logger.error(f"Error handling {path}: {e}")
        return respond(500, {"error": "Internal server error"})


def handle_list(query):
    """Paginated feed sorted by composite score or published date."""
    sort = query.get("sort", "score")
    limit = min(int(query.get("limit", "20")), 100)
    cursor = query.get("cursor")
    vendor = query.get("vendor")
    cwe = query.get("cwe")
    severity = query.get("severity")
    kev_only = query.get("kev", "").lower() == "true"

    if sort == "date":
        index_name = "PublishedDateIndex"
    else:
        index_name = "CompositeScoreIndex"

    kwargs = {
        "IndexName": index_name,
        "KeyConditionExpression": Key("GSI1PK").eq("STATUS#ACTIVE"),
        "ScanIndexForward": False,
        "Limit": limit,
    }

    # Build filter expression
    filters = []
    if vendor:
        filters.append(Attr("affectedVendor").eq(vendor))
    if cwe:
        filters.append(Attr("cweId").eq(cwe))
    if severity:
        filters.append(Attr("cvssSeverity").eq(severity.upper()))
    if kev_only:
        filters.append(Attr("isKEV").eq(True))

    if filters:
        combined = filters[0]
        for f in filters[1:]:
            combined = combined & f
        kwargs["FilterExpression"] = combined

    if cursor:
        try:
            decoded = json.loads(base64.b64decode(cursor))
            kwargs["ExclusiveStartKey"] = decoded
        except Exception:
            pass

    response = table.query(**kwargs)
    items = response.get("Items", [])

    result = {"items": items, "count": len(items)}

    last_key = response.get("LastEvaluatedKey")
    if last_key:
        serializable_key = {}
        for k, v in last_key.items():
            if isinstance(v, Decimal):
                serializable_key[k] = float(v)
            else:
                serializable_key[k] = v
        result["cursor"] = base64.b64encode(
            json.dumps(serializable_key).encode()
        ).decode()

    return respond(200, result)


def handle_detail(cve_id):
    """Detail view for a single CVE."""
    if not cve_id.startswith("CVE-"):
        cve_id = f"CVE-{cve_id}"

    response = table.get_item(Key={"PK": f"CVE#{cve_id}", "SK": "METADATA"})
    item = response.get("Item")

    if not item:
        return respond(404, {"error": f"CVE {cve_id} not found"})

    return respond(200, item)


def handle_search(query):
    """Search by keyword in CVE ID or description."""
    q = query.get("q", "").strip()
    if not q:
        return respond(400, {"error": "Query parameter 'q' is required"})

    kwargs = {
        "FilterExpression": Attr("cveId").contains(q.upper())
        | Attr("description").contains(q),
        "Limit": 100,
    }

    response = table.scan(**kwargs)
    items = response.get("Items", [])

    items.sort(key=lambda x: float(x.get("compositeScore", 0)), reverse=True)

    return respond(200, {"items": items, "count": len(items)})


def handle_top10():
    """Top 10 highest composite score CVEs from the past 7 days."""
    seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()

    response = table.query(
        IndexName="CompositeScoreIndex",
        KeyConditionExpression=Key("GSI1PK").eq("STATUS#ACTIVE"),
        ScanIndexForward=False,
        Limit=50,
    )

    items = response.get("Items", [])

    recent = []
    for item in items:
        pub_date = item.get("publishedDate", "")
        if pub_date >= seven_days_ago:
            recent.append(item)
        if len(recent) >= 10:
            break

    return respond(200, {"items": recent, "count": len(recent)})


def handle_stats():
    """Dashboard stats: total CVEs, KEV count, avg EPSS, CVEs this week."""
    seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()

    total = 0
    kev_count = 0
    epss_sum = 0.0
    this_week = 0

    scan_kwargs = {"Select": "ALL_ATTRIBUTES"}
    while True:
        response = table.scan(**scan_kwargs)
        items = response.get("Items", [])

        for item in items:
            total += 1
            if item.get("isKEV"):
                kev_count += 1
            epss_sum += float(item.get("epssScore", 0))
            if item.get("publishedDate", "") >= seven_days_ago:
                this_week += 1

        last_key = response.get("LastEvaluatedKey")
        if not last_key:
            break
        scan_kwargs["ExclusiveStartKey"] = last_key

    avg_epss = round(epss_sum / total, 5) if total > 0 else 0

    return respond(
        200,
        {
            "totalCVEs": total,
            "kevCount": kev_count,
            "avgEPSS": avg_epss,
            "cvesThisWeek": this_week,
        },
    )


def handle_trends():
    """KEV additions over time (monthly counts for past 12 months)."""
    now = datetime.now(timezone.utc)
    twelve_months_ago = (now - timedelta(days=365)).strftime("%Y-%m")

    monthly_counts = {}

    scan_kwargs = {
        "FilterExpression": Attr("isKEV").eq(True),
    }

    while True:
        response = table.scan(**scan_kwargs)
        items = response.get("Items", [])

        for item in items:
            date_added = item.get("kevDateAdded", "")
            if date_added and len(date_added) >= 7:
                month = date_added[:7]
                if month >= twelve_months_ago:
                    monthly_counts[month] = monthly_counts.get(month, 0) + 1

        last_key = response.get("LastEvaluatedKey")
        if not last_key:
            break
        scan_kwargs["ExclusiveStartKey"] = last_key

    trends = []
    for i in range(12):
        d = now - timedelta(days=30 * (11 - i))
        month_key = d.strftime("%Y-%m")
        trends.append({"month": month_key, "count": monthly_counts.get(month_key, 0)})

    return respond(200, {"trends": trends})
