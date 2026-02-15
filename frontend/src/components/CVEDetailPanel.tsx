import type { Vulnerability } from "@/types/vulnerability";
import { formatDate, formatEPSS, severityColor } from "@/lib/utils";
import { SeverityBadge } from "./SeverityBadge";
import { KEVBadge } from "./KEVBadge";
import { CompositeScore } from "./CompositeScore";

interface CVEDetailPanelProps {
  vulnerability: Vulnerability | null;
  onClose: () => void;
}

export function CVEDetailPanel({ vulnerability, onClose }: CVEDetailPanelProps) {
  if (!vulnerability) return null;

  const color = severityColor(vulnerability.cvssSeverity);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-[480px] z-50 glass-strong overflow-y-auto animate-fade-in-up"
        style={{ animationDuration: "0.3s" }}
      >
        <div className="p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors text-xl"
          >
            &times;
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="font-mono text-xl font-bold text-text-primary">
              {vulnerability.cveId}
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              {vulnerability.affectedVendor} / {vulnerability.affectedProduct}
            </p>
          </div>

          {/* Composite Score */}
          <div className="glass p-4 text-center mb-6">
            <p className="text-xs text-text-muted font-sans uppercase tracking-wider mb-2">
              Composite Risk Score
            </p>
            <CompositeScore score={vulnerability.compositeScore} size="lg" />
          </div>

          {/* Scores Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="glass p-3">
              <p className="text-xs text-text-muted font-sans">CVSS Score</p>
              <p className="font-mono text-lg font-semibold mt-1" style={{ color }}>
                {vulnerability.cvssScore.toFixed(1)}
              </p>
              <SeverityBadge severity={vulnerability.cvssSeverity} />
            </div>
            <div className="glass p-3">
              <p className="text-xs text-text-muted font-sans">EPSS Score</p>
              <p className="font-mono text-lg font-semibold text-primary mt-1">
                {formatEPSS(vulnerability.epssScore)}
              </p>
              <p className="text-xs text-text-muted">
                Percentile: {(vulnerability.epssPercentile * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* KEV Status */}
          {vulnerability.isKEV && (
            <div className="glass p-4 mb-6 border-l-2 border-primary-bright">
              <div className="flex items-center gap-2 mb-2">
                <KEVBadge />
                <span className="text-sm font-sans text-text-primary">Known Exploited Vulnerability</span>
              </div>
              {vulnerability.kevDateAdded && (
                <p className="text-xs text-text-secondary">
                  Added to KEV: {formatDate(vulnerability.kevDateAdded)}
                </p>
              )}
              {vulnerability.kevDueDate && (
                <p className="text-xs text-warning font-semibold mt-1">
                  Remediation Deadline: {formatDate(vulnerability.kevDueDate)}
                </p>
              )}
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-sans font-semibold text-text-primary mb-2">
              Description
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {vulnerability.description}
            </p>
          </div>

          {/* Metadata */}
          <div className="space-y-2 mb-6">
            {vulnerability.cweId && (
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">CWE</span>
                <span className="font-mono text-text-secondary">{vulnerability.cweId}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Published</span>
              <span className="text-text-secondary">{formatDate(vulnerability.publishedDate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Last Modified</span>
              <span className="text-text-secondary">{formatDate(vulnerability.lastModified)}</span>
            </div>
          </div>

          {/* References */}
          {vulnerability.references.length > 0 && (
            <div>
              <h3 className="text-sm font-sans font-semibold text-text-primary mb-2">
                References
              </h3>
              <div className="space-y-1.5">
                {vulnerability.references.map((ref, i) => (
                  <a
                    key={i}
                    href={ref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-primary hover:text-primary-bright transition-colors truncate"
                  >
                    {ref}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
