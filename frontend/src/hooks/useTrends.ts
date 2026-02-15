import { useState, useEffect } from "react";
import type { TrendPoint } from "@/types/vulnerability";
import { getTrends } from "@/services/api";

export function useTrends() {
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTrends()
      .then((data) => setTrends(data.trends))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { trends, loading, error };
}
