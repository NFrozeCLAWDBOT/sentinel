import { useState, useEffect } from "react";
import type { Vulnerability } from "@/types/vulnerability";
import { getTop10 } from "@/services/api";

export function useTop10() {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTop10()
      .then((data) => setVulnerabilities(data.items))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { vulnerabilities, loading, error };
}
