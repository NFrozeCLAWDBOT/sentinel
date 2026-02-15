export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function severityColor(severity: string): string {
  switch (severity) {
    case "CRITICAL":
      return "#DC2626";
    case "HIGH":
      return "#EA580C";
    case "MEDIUM":
      return "#D97706";
    case "LOW":
      return "#44403C";
    default:
      return "#44403C";
  }
}

export function severityBorderClass(severity: string): string {
  switch (severity) {
    case "CRITICAL":
      return "severity-border-critical";
    case "HIGH":
      return "severity-border-high";
    case "MEDIUM":
      return "severity-border-medium";
    case "LOW":
      return "severity-border-low";
    default:
      return "severity-border-low";
  }
}

export function severityGlowClass(severity: string): string {
  switch (severity) {
    case "CRITICAL":
      return "glow-critical";
    case "HIGH":
      return "glow-high";
    case "MEDIUM":
      return "glow-medium";
    case "LOW":
      return "glow-low";
    default:
      return "glow-low";
  }
}

export function formatScore(score: number): string {
  return score.toFixed(1);
}

export function formatEPSS(score: number): string {
  return (score * 100).toFixed(2) + "%";
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getScoreSeverity(compositeScore: number): string {
  if (compositeScore >= 70) return "CRITICAL";
  if (compositeScore >= 50) return "HIGH";
  if (compositeScore >= 25) return "MEDIUM";
  return "LOW";
}
