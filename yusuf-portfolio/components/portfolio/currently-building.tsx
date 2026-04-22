import { TechBadge } from "@/components/ui/tech-badge";
import { GlassCard } from "@/components/ui/glass-card";
import type { CurrentBuild } from "@/lib/portfolio-builds";
import { getTechColor } from "@/lib/tech-colors";

function statusBadge(status: CurrentBuild["status"]) {
  switch (status) {
    case "building":
      return (
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px]"
          style={{
            background: "color-mix(in srgb, var(--js) 18%, transparent)",
            border: "1px solid color-mix(in srgb, var(--js) 40%, transparent)",
            color: "var(--js)",
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--js)]" />
          building
        </span>
      );
    case "launching":
      return (
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px]"
          style={{
            background: "color-mix(in srgb, var(--go) 18%, transparent)",
            border: "1px solid color-mix(in srgb, var(--go) 40%, transparent)",
            color: "var(--go)",
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--go)]" />
          launching
        </span>
      );
    case "shipped":
      return (
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[10px]"
          style={{
            background: "color-mix(in srgb, #34c759 18%, transparent)",
            border: "1px solid color-mix(in srgb, #34c759 40%, transparent)",
            color: "#34c759",
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#34c759]" />
          shipped
        </span>
      );
  }
}

export function CurrentlyBuilding({ builds }: { builds: CurrentBuild[] }) {
  if (!builds.length) return null;

  return (
    <section
      id="currently-building"
      className="relative scroll-mt-32 border-b border-[var(--glass-border)]/40 bg-[#000000] text-[var(--text-primary)]"
    >
      <div className="mx-auto max-w-wide px-gutter py-section">
        <p className="mb-3 font-mono text-xs text-[var(--text-muted)] md:text-sm">{"// now"}</p>
        <h2 className="font-display mb-10 text-balance text-[clamp(2rem,5vw,3rem)] font-normal tracking-[-0.02em] text-white md:mb-12">
          Currently Building
        </h2>
        <p className="mb-8 font-mono text-sm text-[var(--text-muted)]">
          What&apos;s on my workbench right now.
        </p>

        <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4">
          {builds.map((build) => {
            const color1 = build.techStack[0] ? getTechColor(build.techStack[0]) : "var(--react)";
            const color2 = build.techStack[1] ? getTechColor(build.techStack[1]) : color1;

            return (
              <div key={build.id} className="snap-start shrink-0 w-[300px]">
                <GlassCard className="flex h-full flex-col gap-4 p-5" disableHoverScale>
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-4xl" role="img" aria-label={build.title}>
                      {build.emoji}
                    </span>
                    {statusBadge(build.status)}
                  </div>

                  <div>
                    <h3 className="font-mono font-medium text-white">{build.title}</h3>
                    {build.description && (
                      <p className="mt-1.5 font-mono text-xs leading-relaxed text-[var(--text-muted)]">
                        {build.description}
                      </p>
                    )}
                  </div>

                  {build.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {build.techStack.map((tech) => (
                        <TechBadge key={tech} tech={tech} size="sm" />
                      ))}
                    </div>
                  )}

                  <div className="mt-auto">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[var(--text-muted)]">Progress</span>
                      <span className="font-mono text-xs text-[var(--text-secondary)]">
                        {build.progress}%
                      </span>
                    </div>
                    <div className="h-1 w-full rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${build.progress}%`,
                          background: `linear-gradient(90deg, ${color1}, ${color2})`,
                        }}
                      />
                    </div>
                  </div>
                </GlassCard>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
