import type { StatsData, TrendsData, PaginatedResponse, Vulnerability } from "@/types/vulnerability";

const API_URL = import.meta.env.VITE_API_URL || "";

async function fetchJSON<T>(path: string): Promise<T> {
  const url = `${API_URL}${path}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function getStats(): Promise<StatsData> {
  return fetchJSON<StatsData>("/api/stats");
}

export async function getTrends(): Promise<TrendsData> {
  return fetchJSON<TrendsData>("/api/trends");
}

export async function getTop10(): Promise<PaginatedResponse> {
  return fetchJSON<PaginatedResponse>("/api/vulnerabilities/top10");
}

export async function getVulnerabilities(params: {
  sort?: "score" | "date";
  limit?: number;
  cursor?: string;
  severity?: string;
  kev?: boolean;
  vendor?: string;
  cwe?: string;
}): Promise<PaginatedResponse> {
  const searchParams = new URLSearchParams();
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.cursor) searchParams.set("cursor", params.cursor);
  if (params.severity) searchParams.set("severity", params.severity);
  if (params.kev) searchParams.set("kev", "true");
  if (params.vendor) searchParams.set("vendor", params.vendor);
  if (params.cwe) searchParams.set("cwe", params.cwe);

  const qs = searchParams.toString();
  return fetchJSON<PaginatedResponse>(`/api/vulnerabilities${qs ? `?${qs}` : ""}`);
}

export async function getVulnerability(cveId: string): Promise<Vulnerability> {
  return fetchJSON<Vulnerability>(`/api/vulnerabilities/${cveId}`);
}

export async function searchVulnerabilities(query: string): Promise<PaginatedResponse> {
  return fetchJSON<PaginatedResponse>(`/api/vulnerabilities/search?q=${encodeURIComponent(query)}`);
}
