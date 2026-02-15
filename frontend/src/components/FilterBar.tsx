import { useState } from "react";

interface FilterBarProps {
  onSearch: (query: string) => void;
  onSeverityFilter: (severity: string | null) => void;
  onKEVToggle: (kevOnly: boolean) => void;
  onSortChange: (sort: "score" | "date") => void;
  activeSeverity: string | null;
  kevOnly: boolean;
  sort: "score" | "date";
}

const SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;

const severityColors: Record<string, string> = {
  CRITICAL: "#DC2626",
  HIGH: "#EA580C",
  MEDIUM: "#D97706",
  LOW: "#44403C",
};

export function FilterBar({
  onSearch,
  onSeverityFilter,
  onKEVToggle,
  onSortChange,
  activeSeverity,
  kevOnly,
  sort,
}: FilterBarProps) {
  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="glass-strong sticky top-0 z-40 p-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <input
          type="text"
          placeholder="Search CVEs..."
          value={searchValue}
          onChange={handleSearchChange}
          className="bg-surface/80 border border-border/50 rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary/50 font-sans w-full sm:w-64"
        />

        {/* Severity Toggles */}
        <div className="flex gap-1.5">
          {SEVERITIES.map((sev) => (
            <button
              key={sev}
              onClick={() => onSeverityFilter(activeSeverity === sev ? null : sev)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all duration-200"
              style={{
                backgroundColor: activeSeverity === sev ? `${severityColors[sev]}30` : "rgba(45, 40, 37, 0.6)",
                color: activeSeverity === sev ? severityColors[sev] : "#A8A29E",
                border: `1px solid ${activeSeverity === sev ? `${severityColors[sev]}50` : "rgba(74, 64, 64, 0.3)"}`,
              }}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* KEV Toggle */}
        <button
          onClick={() => onKEVToggle(!kevOnly)}
          className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all duration-200"
          style={{
            backgroundColor: kevOnly ? "rgba(251, 191, 36, 0.2)" : "rgba(45, 40, 37, 0.6)",
            color: kevOnly ? "#FBBF24" : "#A8A29E",
            border: `1px solid ${kevOnly ? "rgba(251, 191, 36, 0.4)" : "rgba(74, 64, 64, 0.3)"}`,
          }}
        >
          KEV Only
        </button>

        {/* Sort Toggle */}
        <div className="flex gap-1 ml-auto">
          <button
            onClick={() => onSortChange("score")}
            className="px-2.5 py-1.5 rounded-lg text-xs font-sans transition-all duration-200"
            style={{
              backgroundColor: sort === "score" ? "rgba(212, 105, 26, 0.2)" : "rgba(45, 40, 37, 0.6)",
              color: sort === "score" ? "#D4691A" : "#A8A29E",
              border: `1px solid ${sort === "score" ? "rgba(212, 105, 26, 0.4)" : "rgba(74, 64, 64, 0.3)"}`,
            }}
          >
            By Score
          </button>
          <button
            onClick={() => onSortChange("date")}
            className="px-2.5 py-1.5 rounded-lg text-xs font-sans transition-all duration-200"
            style={{
              backgroundColor: sort === "date" ? "rgba(212, 105, 26, 0.2)" : "rgba(45, 40, 37, 0.6)",
              color: sort === "date" ? "#D4691A" : "#A8A29E",
              border: `1px solid ${sort === "date" ? "rgba(212, 105, 26, 0.4)" : "rgba(74, 64, 64, 0.3)"}`,
            }}
          >
            By Date
          </button>
        </div>
      </div>
    </div>
  );
}
