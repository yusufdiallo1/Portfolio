"use client";

import { useEffect } from "react";

import { AccentButton } from "@/components/ui/accent-button";

export default function PortfolioError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center bg-[var(--bg)] px-gutter py-section text-center">
      <p className="mb-2 font-mono text-xs text-[var(--text-muted)]">{"// something went wrong"}</p>
      <h1 className="font-display mb-4 text-2xl text-white">Couldn&apos;t load this page</h1>
      <p className="mb-8 max-w-md font-mono text-sm text-[var(--text-secondary)]">
        The portfolio shell is still here — try again, or run a clean dev build if assets failed to load.
      </p>
      <AccentButton type="button" variant="filled" className="font-mono" onClick={reset}>
        Try again
      </AccentButton>
    </main>
  );
}
