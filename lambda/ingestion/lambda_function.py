import json
import os
import time
import logging
from datetime import datetime, timedelta, timezone
from decimal import Decimal

import boto3
import requests

logger = logging.getLogger()
logger.setLevel(logging.INFO)

TABLE_NAME = os.environ.get("TABLE_NAME", "sentinel-vulnerabilities")
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME)

NVD_API_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0"
KEV_URL = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"
EPSS_API_URL = "https://api.first.org/data/v1/epss"

CVSS_WEIGHT = 0.35
EPSS_WEIGHT = 0.40
KEV_BONUS = 25


def handler(event, context):
    logger.info("Starting vulnerability ingestion")

    # Step 1: Fetch CISA KEV catalogue
    kev_lookup = fetch_kev()
    logger.info(f"KEV catalogue loaded: {len(kev_lookup)} entries")

    # Step 2: Fetch NVD CVEs (last 7 days)
    cves = fetch_nvd_cves()
    logger.info(f"NVD CVEs fetched: {len(cves)}")

    if not cves:
        logger.info("No CVEs to process")
        return {"statusCode": 200, "body": "No CVEs to process"}

    # Step 3: Fetch EPSS scores
    cve_ids = [c["cve"]["id"] for c in cves]
    epss_lookup = fetch_epss_scores(cve_ids)
    logger.info(f"EPSS scores fetched: {len(epss_lookup)} entries")

    # Step 4: Merge and write to DynamoDB
    written = 0
    with table.batch_writer() as batch:
        for cve_data in cves:
            item = build_item(cve_data, kev_lookup, epss_lookup)
            if item:
                batch.put_item(Item=item)
                written += 1

    logger.info(f"Ingestion complete: {written} CVEs written to DynamoDB")
    return {"statusCode": 200, "body": f"Processed {written} CVEs"}


def fetch_kev():
    """Fetch CISA KEV catalogue and return lookup dict by CVE ID."""
    try:
        resp = requests.get(KEV_URL, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        lookup = {}
        for vuln in data.get("vulnerabilities", []):
            cve_id = vuln.get("cveID")
            if cve_id:
                lookup[cve_id] = {
                    "dateAdded": vuln.get("dateAdded", ""),
                    "dueDate": vuln.get("dueDate", ""),
                }
        return lookup
    except Exception as e:
        logger.error(f"Failed to fetch KEV: {e}")
        return {}


def fetch_nvd_cves():
    """Fetch CVEs from NVD API modified in the last 7 days."""
    now = datetime.now(timezone.utc)
    last_mod_start = (now - timedelta(days=7)).strftime("%Y-%m-%dT%H:%M:%S.000")
    last_mod_end = now.strftime("%Y-%m-%dT%H:%M:%S.000")

    all_cves = []
    start_index = 0
    results_per_page = 2000

    while True:
        params = {
            "lastModStartDate": last_mod_start,
            "lastModEndDate": last_mod_end,
            "startIndex": start_index,
            "resultsPerPage": results_per_page,
        }

        try:
            resp = requests.get(NVD_API_URL, params=params, timeout=60)
            resp.raise_for_status()
            data = resp.json()
        except Exception as e:
            logger.error(f"NVD API error at index {start_index}: {e}")
            break

        vulnerabilities = data.get("vulnerabilities", [])
        all_cves.extend(vulnerabilities)

        total_results = data.get("totalResults", 0)
        start_index += results_per_page

        logger.info(f"NVD page fetched: {len(vulnerabilities)} CVEs (total: {total_results})")

        if start_index >= total_results:
            break

        # Rate limiting: 5 requests per 30 seconds
        time.sleep(6.5)

    return all_cves


def fetch_epss_scores(cve_ids):
    """Fetch EPSS scores in batches of 100."""
    epss_lookup = {}
    batch_size = 100

    for i in range(0, len(cve_ids), batch_size):
        batch = cve_ids[i : i + batch_size]
        cve_param = ",".join(batch)

        try:
            resp = requests.get(EPSS_API_URL, params={"cve": cve_param}, timeout=30)
            resp.raise_for_status()
            data = resp.json()

            for entry in data.get("data", []):
                cve_id = entry.get("cve")
                if cve_id:
                    epss_lookup[cve_id] = {
                        "score": float(entry.get("epss", 0)),
                        "percentile": float(entry.get("percentile", 0)),
                    }
        except Exception as e:
            logger.error(f"EPSS API error for batch starting at {i}: {e}")

        if i + batch_size < len(cve_ids):
            time.sleep(1)

    return epss_lookup


def build_item(cve_data, kev_lookup, epss_lookup):
    """Build a DynamoDB item from NVD CVE data enriched with KEV and EPSS."""
    cve = cve_data.get("cve", {})
    cve_id = cve.get("id")
    if not cve_id:
        return None

    # Extract description
    descriptions = cve.get("descriptions", [])
    description = ""
    for desc in descriptions:
        if desc.get("lang") == "en":
            description = desc.get("value", "")
            break

    # Extract CVSS score - prefer v3.1, fallback v2
    cvss_score = 0.0
    cvss_severity = "LOW"
    metrics = cve.get("metrics", {})

    if "cvssMetricV31" in metrics and metrics["cvssMetricV31"]:
        cvss_data = metrics["cvssMetricV31"][0].get("cvssData", {})
        cvss_score = float(cvss_data.get("baseScore", 0.0))
        cvss_severity = cvss_data.get("baseSeverity", "LOW")
    elif "cvssMetricV2" in metrics and metrics["cvssMetricV2"]:
        cvss_data = metrics["cvssMetricV2"][0].get("cvssData", {})
        cvss_score = float(cvss_data.get("baseScore", 0.0))
        # Map v2 score to severity
        if cvss_score >= 9.0:
            cvss_severity = "CRITICAL"
        elif cvss_score >= 7.0:
            cvss_severity = "HIGH"
        elif cvss_score >= 4.0:
            cvss_severity = "MEDIUM"
        else:
            cvss_severity = "LOW"

    # EPSS data
    epss_data = epss_lookup.get(cve_id, {})
    epss_score = epss_data.get("score", 0.0)
    epss_percentile = epss_data.get("percentile", 0.0)

    # KEV data
    kev_data = kev_lookup.get(cve_id)
    is_kev = kev_data is not None

    # Composite score
    normalized_cvss = cvss_score * 10
    normalized_epss = epss_score * 100
    composite = (CVSS_WEIGHT * normalized_cvss) + (EPSS_WEIGHT * normalized_epss)
    if is_kev:
        composite += KEV_BONUS
    composite = min(composite, 100.0)

    # Extract vendor/product from CPE
    vendor = "Unknown"
    product = "Unknown"
    configurations = cve.get("configurations", [])
    if configurations:
        for config in configurations:
            for node in config.get("nodes", []):
                for cpe_match in node.get("cpeMatch", []):
                    criteria = cpe_match.get("criteria", "")
                    parts = criteria.split(":")
                    if len(parts) > 4:
                        vendor = parts[3].replace("_", " ").title()
                        product = parts[4].replace("_", " ").title()
                        break
                if vendor != "Unknown":
                    break
            if vendor != "Unknown":
                break

    # Extract CWE
    cwe_id = ""
    weaknesses = cve.get("weaknesses", [])
    if weaknesses:
        for weakness in weaknesses:
            for desc in weakness.get("description", []):
                val = desc.get("value", "")
                if val.startswith("CWE-"):
                    cwe_id = val
                    break
            if cwe_id:
                break

    # Extract references
    references = []
    for ref in cve.get("references", []):
        references.append(ref.get("url", ""))

    published_date = cve.get("published", "")
    last_modified = cve.get("lastModified", "")
    now_iso = datetime.now(timezone.utc).isoformat()

    item = {
        "PK": f"CVE#{cve_id}",
        "SK": "METADATA",
        "cveId": cve_id,
        "description": description,
        "cvssScore": Decimal(str(round(cvss_score, 1))),
        "cvssSeverity": cvss_severity,
        "epssScore": Decimal(str(round(epss_score, 5))),
        "epssPercentile": Decimal(str(round(epss_percentile, 5))),
        "isKEV": is_kev,
        "compositeScore": Decimal(str(round(composite, 2))),
        "affectedVendor": vendor,
        "affectedProduct": product,
        "cweId": cwe_id,
        "references": references[:10],
        "publishedDate": published_date,
        "lastModified": last_modified,
        "updatedAt": now_iso,
        # GSI attributes
        "GSI1PK": "STATUS#ACTIVE",
        "GSI3PK": f"VENDOR#{vendor}",
    }

    if is_kev and kev_data:
        item["kevDateAdded"] = kev_data.get("dateAdded", "")
        item["kevDueDate"] = kev_data.get("dueDate", "")

    return item
