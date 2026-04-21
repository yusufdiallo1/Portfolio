/**
 * Full-page noise (SVG turbulence) + radial vignette. Fixed, non-interactive.
 */
export function PageAtmosphere() {
  return (
    <>
      <svg
        className="pointer-events-none fixed inset-0 z-[1] h-[100dvh] w-full opacity-[0.025]"
        aria-hidden
      >
        <filter id="portfolio-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="4"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#portfolio-noise)" />
      </svg>
      <div
        className="pointer-events-none fixed inset-0 z-[2] bg-[radial-gradient(ellipse_85%_85%_at_50%_45%,transparent_20%,#000000_100%)] opacity-90"
        aria-hidden
      />
    </>
  );
}
