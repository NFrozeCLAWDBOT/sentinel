import { useState } from "react";
import type { Vulnerability } from "@/types/vulnerability";
import { Hero } from "@/components/Hero";
import { StatBar } from "@/components/StatBar";
import { Top10Row } from "@/components/Top10Row";
import { FilterBar } from "@/components/FilterBar";
import { ThreatFeed } from "@/components/ThreatFeed";
import { CVEDetailPanel } from "@/components/CVEDetailPanel";
import { TrendChart } from "@/components/TrendChart";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Footer } from "@/components/Footer";
import { useStats } from "@/hooks/useStats";
import { useTop10 } from "@/hooks/useTop10";
import { useVulnerabilities } from "@/hooks/useVulnerabilities";
import { useTrends } from "@/hooks/useTrends";

export function App() {
  const [selectedCVE, setSelectedCVE] = useState<Vulnerability | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSeverity, setActiveSeverity] = useState<string | null>(null);
  const [kevOnly, setKevOnly] = useState(false);
  const [sort, setSort] = useState<"score" | "date">("score");

  const { stats, loading: statsLoading } = useStats();
  const { vulnerabilities: top10, loading: top10Loading } = useTop10();
  const { trends, loading: trendsLoading } = useTrends();
  const {
    vulnerabilities: feedItems,
    loading: feedLoading,
    loadingMore,
    hasMore,
    loadMore,
  } = useVulnerabilities({
    sort,
    severity: activeSeverity,
    kevOnly,
    searchQuery,
  });

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Hero Section */}
      <Hero />

      {/* Stat Bar */}
      <div className="relative -mt-20 z-20 max-w-5xl mx-auto">
        <StatBar stats={stats} loading={statsLoading} />
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pt-16 pb-8">
        {/* Top 10 */}
        <ScrollReveal className="mb-12">
          <h2 className="font-mono text-2xl font-bold text-text-primary mb-4 px-4">
            Top Threats This Week
          </h2>
          <Top10Row
            vulnerabilities={top10}
            onSelect={setSelectedCVE}
            loading={top10Loading}
          />
        </ScrollReveal>

        {/* Filter Bar */}
        <div className="mb-6">
          <FilterBar
            onSearch={setSearchQuery}
            onSeverityFilter={setActiveSeverity}
            onKEVToggle={setKevOnly}
            onSortChange={setSort}
            activeSeverity={activeSeverity}
            kevOnly={kevOnly}
            sort={sort}
          />
        </div>

        {/* Live Threat Feed */}
        <ScrollReveal className="mb-12">
          <h2 className="font-mono text-2xl font-bold text-text-primary mb-4">
            Live Threat Feed
          </h2>
          <ThreatFeed
            vulnerabilities={feedItems}
            onSelectCVE={setSelectedCVE}
            onLoadMore={loadMore}
            hasMore={hasMore}
            loading={feedLoading || loadingMore}
          />
        </ScrollReveal>

        {/* Trend Chart */}
        <ScrollReveal className="mb-12">
          <TrendChart trends={trends} loading={trendsLoading} />
        </ScrollReveal>
      </main>

      {/* CVE Detail Panel */}
      <CVEDetailPanel
        vulnerability={selectedCVE}
        onClose={() => setSelectedCVE(null)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
