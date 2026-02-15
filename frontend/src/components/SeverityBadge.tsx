import { severityColor } from "@/lib/utils";

interface SeverityBadgeProps {
  severity: string;
  score?: number;
}

export function SeverityBadge({ severity, score }: SeverityBadgeProps) {
  const color = severityColor(severity);

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono font-semibold"
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      {severity}
      {score !== undefined && <span className="opacity-80">{score.toFixed(1)}</span>}
    </span>
  );
}
