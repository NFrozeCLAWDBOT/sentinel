# Sentinel

**Live:** [sentinel.nfroze.co.uk](https://sentinel.nfroze.co.uk)

![Live](video/sentinel.gif)

Real-time vulnerability intelligence dashboard that fuses NVD, CISA KEV, and EPSS data into a single composite risk score — replacing the enterprise triage tooling most teams can't afford.

## Overview

Security teams are drowning in CVEs. Over 40,000 new vulnerabilities disclosed annually, but fewer than 0.004% end up on CISA's Known Exploited Vulnerabilities list. Without a triage layer, teams patch blind — prioritising by CVSS severity alone, which has no correlation with real-world exploitation. The tools that solve this (Tenable, Rapid7, Recorded Future) start at five figures. Sentinel delivers the same signal for under $3/month.

The system ingests vulnerability data from three federal sources every six hours: NVD for CVE metadata and CVSS scores, CISA KEV for confirmed in-the-wild exploitation, and FIRST EPSS for exploit probability predictions. Each CVE is scored using a weighted composite formula that ranks EPSS (real-world exploitability) higher than CVSS (theoretical severity), with an additive bonus for KEV-listed vulnerabilities. The result is a ranked, filterable, searchable threat feed served through a dark glassmorphic frontend.

This project was produced through an automated end-to-end pipeline: concept, hero art, cinemagraph animation, dark glassmorphic frontend, serverless backend, Terraform infrastructure, and live deployment — one shot, no manual intervention.

## Architecture

The frontend is a React SPA hosted on S3, served through Cloudflare's proxied CNAME for SSL termination. It calls an API Gateway HTTP API backed by a single Python Lambda that reads from DynamoDB. A second Lambda, triggered by EventBridge on a 6-hour schedule, handles data ingestion — pulling paginated results from the NVD API (with rate-limit compliance), the full CISA KEV catalogue, and batched EPSS lookups, then merging and writing unified records via DynamoDB batch writes.

DynamoDB uses a single-table design with three GSIs: `CompositeScoreIndex` for risk-ranked queries, `PublishedDateIndex` for recency-sorted feeds, and `VendorIndex` for vendor-filtered views. All infrastructure is defined in Terraform — DynamoDB, both Lambdas, API Gateway with explicit route ordering, EventBridge scheduling, S3 website hosting, IAM roles, and Cloudflare DNS.

## Tech Stack

**Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Recharts

**Backend**: AWS Lambda (Python 3.12), API Gateway HTTP API, DynamoDB, EventBridge

**Infrastructure**: Terraform, S3 static hosting, Cloudflare DNS + SSL

**Data Sources**: NVD CVE 2.0 API, CISA KEV JSON Feed, FIRST EPSS API

**Design**: Dark glassmorphism, animated cinemagraph hero, JetBrains Mono + Space Grotesk typography

## Key Decisions

- **EPSS weighted higher than CVSS (40% vs 35%)**: CVSS measures theoretical severity. EPSS measures observed exploit probability. The composite formula — `(0.35 * CVSS) + (0.40 * EPSS) + KEV bonus` — reflects that a medium-severity vulnerability being actively exploited matters more than a critical one that isn't. This mirrors how mature threat intel teams actually prioritise.

- **Single-table DynamoDB with three GSIs**: One table serves all access patterns — score-ranked feeds, date-sorted feeds, vendor filtering, and direct CVE lookups — without cross-table joins or additional Lambda complexity. PAY_PER_REQUEST billing keeps costs near zero at low traffic volumes.

- **Separate least-privilege IAM roles**: The API Lambda gets read-only DynamoDB access (`GetItem`, `Query`, `Scan`). The ingestion Lambda gets read-write. This isn't just a best practice checkbox — it limits blast radius if either function is compromised.

- **Fully serverless at ~$2-3/month**: No servers, no containers, no always-on compute. Lambda invocations are minimal (scheduled ingestion + low-traffic API), DynamoDB on-demand pricing scales to zero, and the three data sources are free public APIs. The entire stack costs less than a coffee.

## Built By

**Jarvis** — AI build system designed by [Noah Frost](https://noahfrost.co.uk)

This project was produced through an automated end-to-end pipeline: brief, hero art, cinemagraph, build spec, deployed webapp. One shot. No manual intervention.

-> System architect: [Noah Frost](https://noahfrost.co.uk)
-> LinkedIn: [linkedin.com/in/nfroze](https://linkedin.com/in/nfroze)
-> GitHub: [github.com/nfroze](https://github.com/nfroze)
