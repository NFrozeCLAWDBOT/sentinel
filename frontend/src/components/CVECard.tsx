import type { Vulnerability } from "@/types/vulnerability";
import { severityBorderClass, formatDate, formatEPSS } from "@/lib/utils";
import { SeverityBadge } from "./SeverityBadge";
import { KEVBadge } from "./KEVBadge";
import { CompositeScore } from "./CompositeScore";

interface CVECardProps {
  vulnerability: Vulnerability;
  onClick: (vuln: Vulnerability) => void;
}

export function CVECard({ vulnerability, onClick }: CVECardProps) {
  const borderClass = severityBorderClass(vulnerability.cvssSeverity);

  return (
    <div
      className={`glass glass-hover ${borderClass} p-4 cursor-pointer transition-all duration-200`}
      onClick={() => onClick(vulnerability)}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: CVE ID + Score */}
        <div className="flex items-center gap-4">
          <CompositeScore score={vulnerability.compositeScore} />
          <div>
            <h3 className="font-mono text-sm font-semibold text-text-primary">
              {vulnerability.cveId}
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              {vulnerability.affectedVendor} / {vulnerability.affectedProduct}
            </p>
          </div>
        </div>

        {/* Right: Badges */}
        <div className="flex flex-wrap gap-1.5 items-start shrink-0">
          <SeverityBadge severity={vulnerability.cvssSeverity} score={vulnerability.cvssScore} />
          {vulnerability.isKEV && <KEVBadge dueDate={vulnerability.kevDueDate} />}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-text-secondary mt-3 line-clamp-2">
        {vulnerability.description}
      </p>

      {/* Footer metadata */}
      <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
        <span>EPSS: {formatEPSS(vulnerability.epssScore)}</span>
        <span>Percentile: {(vulnerability.epssPercentile * 100).toFixed(1)}%</span>
        {vulnerability.cweId && <span>{vulnerability.cweId}</span>}
        <span className="ml-auto">{formatDate(vulnerability.publishedDate)}</span>
      </div>
    </div>
  );
}
