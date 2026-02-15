import { Hero } from "@/components/Hero";
import { StatBar } from "@/components/StatBar";
import { Footer } from "@/components/Footer";

export function App() {
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Hero Section */}
      <Hero />

      {/* Stat Bar - overlapping hero bottom */}
      <div className="relative -mt-20 z-20 max-w-5xl mx-auto">
        <StatBar stats={null} loading={true} />
      </div>

      {/* Main Content Area - placeholder */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center text-text-secondary">
          <p className="font-mono text-lg">Loading threat intelligence...</p>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
