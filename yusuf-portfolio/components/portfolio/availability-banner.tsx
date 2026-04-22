import Link from "next/link";

import { cn } from "@/lib/utils";
import type { AvailabilityPublicConfig, AvailabilityStatus } from "@/lib/site-config";

type Props = {
  config: AvailabilityPublicConfig;
};

function labelForStatus(status: AvailabilityStatus, message: string) {
  switch (status) {
    case "available":
      return (
        <>
          <span className="availability-banner__dot inline-flex shrink-0" aria-hidden>
            🟢
          </span>
          <span className="min-w-0 truncate">{message}</span>
        </>
      );
    case "busy":
      return (
        <>
          <span className="shrink-0" aria-hidden>
            🟡
          </span>
          <span className="min-w-0">Currently busy — taking requests for next month</span>
        </>
      );
    case "unavailable":
      return (
        <>
          <span className="shrink-0" aria-hidden>
            🔴
          </span>
          <span className="min-w-0">Not taking new projects right now</span>
        </>
      );
    default:
      return null;
  }
}

export function AvailabilityBanner({ config }: Props) {
  if (!config.showBanner) return null;

  const url = config.calendlyUrl?.trim();

  return (
    <div
      className={cn(
        "fixed left-0 right-0 top-0 z-[210] flex h-10 w-full items-center border-b border-white/10 bg-black/80 backdrop-blur-md overflow-hidden",
        config.status === "available" && "availability-banner--available"
      )}
      role="region"
      aria-label="Availability"
    >
      {/* Animated glow background */}
      {config.status === "available" && (
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--react)] to-transparent animate-availability-sweep" />
        </div>
      )}
      
      <div className="relative z-10 mx-auto flex w-full max-w-wide items-center justify-between gap-3 px-gutter font-mono text-[11px] text-[var(--text-secondary)] md:text-xs">
        <p className="flex min-w-0 flex-1 items-center gap-2.5 truncate">
          {config.status === "available" ? (
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--react)] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--react)]"></span>
            </span>
          ) : null}
          {labelForStatus(config.status, config.message)}
        </p>
        {url ? (
          <Link
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 shrink-0 rounded-full border border-[var(--react)]/30 bg-[var(--react)]/10 px-3 py-1 font-mono text-[10px] text-[var(--react)] transition-all hover:bg-[var(--react)] hover:text-black md:text-[11px]"
          >
            <span>Book a Call</span>
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
