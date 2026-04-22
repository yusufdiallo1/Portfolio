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
        "fixed left-0 right-0 top-0 z-[100] flex h-9 w-full items-center border-b border-[var(--glass-border)] bg-black",
        config.status === "available" && "availability-banner--available"
      )}
      role="region"
      aria-label="Availability"
    >
      <div className="mx-auto flex w-full max-w-wide items-center justify-between gap-3 px-gutter font-mono text-[11px] text-[var(--text-secondary)] md:text-xs">
        <p className="flex min-w-0 flex-1 items-center gap-2 truncate">
          {labelForStatus(config.status, config.message)}
        </p>
        {url ? (
          <Link
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 font-mono text-[11px] text-[var(--react)] transition-colors hover:underline md:text-xs"
          >
            Book a Call →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
