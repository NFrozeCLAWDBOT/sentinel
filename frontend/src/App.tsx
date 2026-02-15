import { useState, useMemo } from "react";
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
import { mockStats, mockVulnerabilities, mockTrends } from "@/data/mockData";

export function App() {
  const [selectedCVE, setSelectedCVE] = useState<Vulnerability | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSeverity, setActiveSeverity] = useState<string | null>(null);
  const [kevOnly, setKevOnly] = useState(false);
  const [sort, setSort] = useState<"score" | "date">("score");

  const top10 = useMemo(
    () => [...mockVulnerabilities].sort((a, b) => b.compositeScore - a.compositeScore).slice(0, 10),
    []
  );

  const filtered = useMemo(() => {
    let result = [...mockVulnerabilities];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.cveId.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          v.affectedVendor.toLowerCase().includes(q) ||
          v.affectedProduct.toLowerCase().includes(q)
      );
    }

    if (activeSeverity) {
      result = result.filter((v) => v.cvssSeverity === activeSeverity);
    }

    if (kevOnly) {
      result = result.filter((v) => v.isKEV);
    }

    if (sort === "score") {
      result.sort((a, b) => b.compositeScore - a.compositeScore);
    } else {
      result.sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
    }

    return result;
  }, [searchQuery, activeSeverity, kevOnly, sort]);

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Hero Section */}
      <Hero />

      {/* Stat Bar */}
      <div className="relative -mt-20 z-20 max-w-5xl mx-auto">
        <StatBar stats={mockStats} />
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pt-16 pb-8">
        {/* Top 10 */}
        <ScrollReveal className="mb-12">
          <h2 className="font-mono text-2xl font-bold text-text-primary mb-4 px-4">
            Top Threats This Week
          </h2>
          <Top10Row vulnerabilities={top10} onSelect={setSelectedCVE} />
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
            vulnerabilities={filtered}
            onSelectCVE={setSelectedCVE}
          />
        </ScrollReveal>

        {/* Trend Chart */}
        <ScrollReveal className="mb-12">
          <TrendChart trends={mockTrends} />
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
