"use client";

const GLYPHS = "{}[]();<>/=01*+-&|?`~#@$%^".split("");

export function CodeRain() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {Array.from({ length: 48 }).map((_, i) => {
        const ch = GLYPHS[i % GLYPHS.length];
        const left = `${(i * 7 + (i % 5) * 13) % 100}%`;
        const delay = `${(i % 12) * 0.4}s`;
        const duration = `${8 + (i % 6)}s`;
        return (
          <span
            key={i}
            className="absolute font-mono text-[10px] text-[var(--text-muted)] opacity-40"
            style={{
              left,
              top: "-5%",
              animation: `code-rain-fall ${duration} linear ${delay} infinite`,
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
}
