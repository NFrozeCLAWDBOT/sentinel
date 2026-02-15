import type { Vulnerability } from "@/types/vulnerability";
import { CVECard } from "./CVECard";

interface ThreatFeedProps {
  vulnerabilities: Vulnerability[];
  onSelectCVE: (vuln: Vulnerability) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
}

export function ThreatFeed({
  vulnerabilities,
  onSelectCVE,
  onLoadMore,
  hasMore,
  loading,
}: ThreatFeedProps) {
  if (loading && vulnerabilities.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="glass p-4 animate-pulse">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-16 bg-surface-elevated rounded" />
                <div>
                  <div className="h-4 bg-surface-elevated rounded w-32 mb-1" />
                  <div className="h-3 bg-surface-elevated rounded w-24" />
                </div>
              </div>
              <div className="h-6 bg-surface-elevated rounded w-20" />
            </div>
            <div className="h-4 bg-surface-elevated rounded w-full mt-3" />
            <div className="h-4 bg-surface-elevated rounded w-2/3 mt-2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {vulnerabilities.map((vuln) => (
        <CVECard key={vuln.cveId} vulnerability={vuln} onClick={onSelectCVE} />
      ))}

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="glass glass-hover px-6 py-3 font-sans text-sm text-text-secondary hover:text-text-primary transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}
