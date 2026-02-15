# Sentinel

Real-time vulnerability intelligence dashboard that fuses NVD, CISA KEV, and EPSS data to surface the CVEs that matter.

## Features

- **Composite Risk Scoring** — Weights EPSS (real-world exploitability) higher than CVSS (theoretical severity), with a bonus for confirmed in-the-wild exploitation
- **CISA KEV Integration** — Highlights vulnerabilities with confirmed exploitation and remediation deadlines
- **EPSS Enrichment** — Exploit Prediction Scoring System data for probability-based prioritisation
- **Live Threat Feed** — Paginated, filterable, searchable CVE feed sorted by risk
- **Top 10 Weekly** — Highest-signal CVEs from the past 7 days at a glance

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite, Tailwind CSS + shadcn/ui
- **Backend:** AWS Lambda (Python 3.12), DynamoDB, API Gateway
- **Infrastructure:** Terraform, S3 static hosting, Cloudflare DNS + SSL
- **Data Sources:** NVD CVE 2.0 API, CISA KEV JSON Feed, FIRST EPSS API

## Architecture

```
Cloudflare (SSL) → S3 (Frontend) → API Gateway → Lambda → DynamoDB
                                                      ↑
                                          EventBridge (6h schedule)
                                                      ↓
                                          Ingestion Lambda → NVD + KEV + EPSS
```

## Live

[https://sentinel.nfroze.co.uk](https://sentinel.nfroze.co.uk)
