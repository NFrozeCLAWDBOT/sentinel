import { useState, useEffect } from "react";
import type { StatsData } from "@/types/vulnerability";
import { getStats } from "@/services/api";

export function useStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading, error };
}
