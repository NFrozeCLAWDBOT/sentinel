import type { Vulnerability } from "@/types/vulnerability";
import { SeverityBadge } from "./SeverityBadge";
import { KEVBadge } from "./KEVBadge";
import { CompositeScore } from "./CompositeScore";

interface Top10RowProps {
  vulnerabilities: Vulnerability[];
  onSelect: (vuln: Vulnerability) => void;
  loading?: boolean;
}

export function Top10Row({ vulnerabilities, onSelect, loading }: Top10RowProps) {
  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 px-4 snap-x snap-mandatory scrollbar-thin">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="glass min-w-[280px] h-[160px] animate-pulse snap-start shrink-0">
            <div className="p-4 space-y-3">
              <div className="h-8 bg-surface-elevated rounded w-20" />
              <div className="h-4 bg-surface-elevated rounded w-32" />
              <div className="h-3 bg-surface-elevated rounded w-40" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (vulnerabilities.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 px-4 snap-x snap-mandatory">
      {vulnerabilities.map((vuln) => (
        <div
          key={vuln.cveId}
          className="glass glass-hover min-w-[280px] p-4 cursor-pointer snap-start shrink-0 transition-all duration-200"
          onClick={() => onSelect(vuln)}
        >
          <div className="flex items-start justify-between mb-2">
            <CompositeScore score={vuln.compositeScore} size="sm" />
            <div className="flex gap-1">
              <SeverityBadge severity={vuln.cvssSeverity} />
              {vuln.isKEV && <KEVBadge />}
            </div>
          </div>
          <h4 className="font-mono text-sm font-semibold text-text-primary mt-2">
            {vuln.cveId}
          </h4>
          <p className="text-xs text-text-secondary mt-1">
            {vuln.affectedVendor} / {vuln.affectedProduct}
          </p>
          <p className="text-xs text-text-muted mt-2 line-clamp-2">
            {vuln.description}
          </p>
        </div>
      ))}
    </div>
  );
}
