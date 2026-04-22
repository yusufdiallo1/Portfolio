"use client";

import { Calendar } from "lucide-react";

import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type Props = {
  calendlyUrl: string;
  className?: string;
};

export function BookCallButton({ calendlyUrl, className }: Props) {
  const url = calendlyUrl?.trim();
  if (!url) return null;

  return (
    <button
      type="button"
      onClick={() => {
        void track("book_call_click", { source: "floating_button" });
        window.open(url, "_blank", "noopener,noreferrer");
      }}
      className={cn(
        "pointer-events-auto fixed bottom-6 left-6 z-[235] flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2.5 font-label text-xs text-[var(--text-primary)] shadow-lg backdrop-blur-md transition-[box-shadow,transform,border-color] duration-200",
        "hover:border-[var(--go)] hover:shadow-[0_0_28px_color-mix(in_srgb,var(--go)_35%,transparent)] active:scale-[0.98]",
        "max-sm:size-12 max-sm:justify-center max-sm:p-0",
        className
      )}
      aria-label="Book a call"
    >
      <Calendar className="size-5 shrink-0 text-[var(--go)] sm:hidden" aria-hidden />
      <span className="hidden font-label sm:inline">📅 Book a Call</span>
    </button>
  );
}
