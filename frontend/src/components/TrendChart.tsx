import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { TrendPoint } from "@/types/vulnerability";

interface TrendChartProps {
  trends: TrendPoint[];
  loading?: boolean;
}

export function TrendChart({ trends, loading }: TrendChartProps) {
  if (loading) {
    return (
      <div className="glass p-6 h-[300px] animate-pulse">
        <div className="h-4 bg-surface-elevated rounded w-48 mb-4" />
        <div className="h-full bg-surface-elevated rounded" />
      </div>
    );
  }

  const formatMonth = (month: string) => {
    const [year, m] = month.split("-");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[parseInt(m) - 1]} ${year.slice(2)}`;
  };

  const data = trends.map((t) => ({
    ...t,
    label: formatMonth(t.month),
  }));

  return (
    <div className="glass p-6">
      <h3 className="font-mono text-lg font-semibold text-text-primary mb-4">
        KEV Additions Over Time
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D4691A" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#D4691A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tick={{ fill: "#78716C", fontSize: 11, fontFamily: "Space Grotesk" }}
            axisLine={{ stroke: "#4A4040" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#78716C", fontSize: 11, fontFamily: "Space Grotesk" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(45, 40, 37, 0.95)",
              border: "1px solid rgba(74, 64, 64, 0.4)",
              borderRadius: "0.5rem",
              color: "#F5F0EB",
              fontFamily: "Space Grotesk",
              fontSize: "12px",
            }}
            labelStyle={{ color: "#A8A29E" }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#D4691A"
            strokeWidth={2}
            fill="url(#amberGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
