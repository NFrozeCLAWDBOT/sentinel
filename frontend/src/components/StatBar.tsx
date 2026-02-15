import { useCountUp } from "@/hooks/useCountUp";
import type { StatsData } from "@/types/vulnerability";

interface StatBarProps {
  stats: StatsData | null;
  loading?: boolean;
}

function StatCard({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  const displayValue = useCountUp(value);

  return (
    <div className="glass px-6 py-4 flex flex-col items-center min-w-[160px]">
      <span className="font-mono text-3xl font-bold text-primary-bright">
        {displayValue.toLocaleString()}{suffix}
      </span>
      <span className="font-sans text-sm text-text-secondary mt-1">{label}</span>
    </div>
  );
}

export function StatBar({ stats, loading }: StatBarProps) {
  if (loading || !stats) {
    return (
      <div className="flex flex-wrap justify-center gap-4 px-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass px-6 py-4 min-w-[160px] h-[80px] animate-pulse">
            <div className="h-8 bg-surface-elevated rounded w-16 mx-auto mb-2" />
            <div className="h-4 bg-surface-elevated rounded w-24 mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-4 px-4">
      <StatCard label="CVEs Tracked" value={stats.totalCVEs} />
      <StatCard label="KEV Entries" value={stats.kevCount} />
      <StatCard label="Avg EPSS %" value={Math.round(stats.avgEPSS * 10000) / 100} suffix="%" />
      <StatCard label="This Week" value={stats.cvesThisWeek} />
    </div>
  );
}
