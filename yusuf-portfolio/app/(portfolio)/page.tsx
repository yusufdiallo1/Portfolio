import { AccentButton } from "@/components/ui/accent-button";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { GlassCard } from "@/components/ui/glass-card";
import { TechBadge } from "@/components/ui/tech-badge";

export default function PortfolioHomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-content flex-col gap-12 px-gutter py-section">
      <header className="space-y-4">
        <h1 className="font-display text-display-lg text-balance text-[var(--text-primary)]">
          Yusuf — full-stack developer
        </h1>
        <p className="max-w-prose text-body-lg text-[var(--text-secondary)]">
          Public portfolio — pure black canvas, language accents, glass UI. Build sections here.
        </p>
      </header>

      <section className="flex flex-wrap gap-3">
        <TechBadge tech="TypeScript" />
        <TechBadge tech="React" />
        <TechBadge tech="Next.js" />
        <TechBadge tech="Supabase" size="sm" />
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard className="p-6">
          <p className="font-label text-sm text-[var(--text-secondary)]">Glass card</p>
          <p className="mt-2 text-body-md">
            <span className="syntax-keyword">const</span>{" "}
            <span className="syntax-type">build</span> = () =&gt;{" "}
            <span className="syntax-string">&quot;ship&quot;</span>
            <span className="syntax-comment">{"// decorative"}</span>
          </p>
        </GlassCard>
        <GlassCard glow="var(--ts)" className="p-6">
          <p className="font-label text-sm text-[var(--text-secondary)]">With glow</p>
          <p className="mt-2 text-body-md text-[var(--text-primary)]">TypeScript accent border + shadow.</p>
        </GlassCard>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <AccentButton variant="filled">Filled</AccentButton>
        <AccentButton variant="ghost">Ghost</AccentButton>
        <AccentButton variant="code" codeBorderColor="var(--js)">
          npm run build
        </AccentButton>
      </div>

      <p className="font-mono text-4xl tabular-nums text-[var(--text-primary)]">
        <AnimatedCounter target={42} suffix="+" />
      </p>
    </main>
  );
}
