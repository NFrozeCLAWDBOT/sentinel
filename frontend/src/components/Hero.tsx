export function Hero() {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/sentinel-hero.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />

      {/* Fallback background for dev (no video) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A1614] via-[#2D2825] to-[#1A1614] -z-10" />

      {/* Content */}
      <div className="relative z-10 text-center">
        <h1 className="font-mono text-6xl md:text-8xl font-bold tracking-wider text-text-primary mb-4">
          SENTINEL
        </h1>
        <p className="font-sans text-xl md:text-2xl text-text-secondary tracking-wide">
          Real-time vulnerability intelligence.
        </p>
      </div>
    </section>
  );
}
