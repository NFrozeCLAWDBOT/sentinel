import { useState, useEffect, useCallback, useRef } from "react";
import type { Vulnerability } from "@/types/vulnerability";
import { getVulnerabilities, searchVulnerabilities } from "@/services/api";

interface UseVulnerabilitiesParams {
  sort: "score" | "date";
  severity?: string | null;
  kevOnly?: boolean;
  searchQuery?: string;
}

export function useVulnerabilities({ sort, severity, kevOnly, searchQuery }: UseVulnerabilitiesParams) {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (searchQuery && searchQuery.length >= 2) {
        const data = await searchVulnerabilities(searchQuery);
        setVulnerabilities(data.items);
        setCursor(undefined);
        setHasMore(false);
      } else {
        const data = await getVulnerabilities({
          sort,
          limit: 20,
          severity: severity || undefined,
          kev: kevOnly || undefined,
        });
        setVulnerabilities(data.items);
        setCursor(data.cursor);
        setHasMore(!!data.cursor);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [sort, severity, kevOnly, searchQuery]);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (searchQuery) {
      debounceTimer.current = setTimeout(fetchData, 300);
    } else {
      fetchData();
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [fetchData, searchQuery]);

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore) return;

    setLoadingMore(true);
    try {
      const data = await getVulnerabilities({
        sort,
        limit: 20,
        cursor,
        severity: severity || undefined,
        kev: kevOnly || undefined,
      });
      setVulnerabilities((prev) => [...prev, ...data.items]);
      setCursor(data.cursor);
      setHasMore(!!data.cursor);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, loadingMore, sort, severity, kevOnly]);

  return { vulnerabilities, loading, loadingMore, hasMore, error, loadMore };
}
