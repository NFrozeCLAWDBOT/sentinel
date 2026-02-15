import { cn, severityGlowClass, getScoreSeverity, severityColor } from "@/lib/utils";

interface CompositeScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export function CompositeScore({ score, size = "md" }: CompositeScoreProps) {
  const severity = getScoreSeverity(score);
  const color = severityColor(severity);
  const glow = severityGlowClass(severity);

  const sizeClasses = {
    sm: "text-lg",
    md: "text-3xl",
    lg: "text-5xl",
  };

  return (
    <span
      className={cn("font-mono font-bold", sizeClasses[size], glow)}
      style={{ color }}
    >
      {score.toFixed(1)}
    </span>
  );
}
