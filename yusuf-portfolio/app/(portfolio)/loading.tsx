/**
 * Shown while the portfolio route resolves — avoids a blank shell during slow data fetches.
 */
export default function PortfolioLoading() {
  return (
    <main className="min-h-screen bg-[var(--bg)]">
      <div className="mx-auto max-w-wide px-gutter py-section">
        <div className="mb-8 h-4 w-32 animate-pulse rounded-md bg-white/[0.06]" />
        <div className="mb-6 h-12 max-w-md animate-pulse rounded-lg bg-white/[0.08]" />
        <div className="mb-4 h-24 animate-pulse rounded-xl border border-[var(--glass-border)]/50 bg-black/40" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-40 animate-pulse rounded-xl border border-[var(--glass-border)]/40 bg-black/30" />
          <div className="h-40 animate-pulse rounded-xl border border-[var(--glass-border)]/40 bg-black/30" />
        </div>
      </div>
    </main>
  );
}
