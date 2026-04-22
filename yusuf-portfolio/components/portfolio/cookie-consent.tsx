"use client";

import { useEffect, useState } from "react";

import { AccentButton } from "@/components/ui/accent-button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "cookie_consent";

export type CookieConsentStatus = "accepted" | "essential" | null;

export function getCookieConsent(): CookieConsentStatus {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === "accepted" || v === "essential") return v;
  return null;
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const existing = getCookieConsent();
    setVisible(!existing);
  }, []);

  function acceptAll() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
    window.dispatchEvent(new Event("cookie-consent-changed"));
  }

  function essentialOnly() {
    localStorage.setItem(STORAGE_KEY, "essential");
    setVisible(false);
    window.dispatchEvent(new Event("cookie-consent-changed"));
  }

  if (!mounted || !visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[250] px-gutter pb-gutter pt-2",
        "pointer-events-none"
      )}
      role="dialog"
      aria-label="Cookie consent"
    >
      <div
        className={cn(
          "pointer-events-auto mx-auto flex max-w-wide flex-col gap-5 rounded-2xl border border-[var(--liquid-border)] p-5 shadow-[0_-8px_48px_rgba(0,0,0,0.55)] sm:flex-row sm:items-center sm:justify-between",
          "glass-strong",
          "bg-gradient-to-br from-white/[0.08] via-black/50 to-black/[0.92]",
          "backdrop-blur-[var(--liquid-blur)] backdrop-saturate-200"
        )}
      >
        <div className="max-w-xl space-y-2">
          <p className="font-label text-sm font-medium tracking-tight text-white">Cookies & privacy</p>
          <p className="font-mono text-xs leading-relaxed text-[var(--text-secondary)]">
            We use cookies for essential site function, optional analytics, and — when you sign in to
            the dashboard later — to keep your session secure. Choose &ldquo;Accept all&rdquo; to
            allow analytics and future dashboard features, or &ldquo;Essential only&rdquo; for the
            minimum needed to browse.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          <AccentButton
            type="button"
            variant="ghost"
            className="font-mono text-xs"
            onClick={essentialOnly}
          >
            Essential only
          </AccentButton>
          <AccentButton type="button" variant="filled" className="font-mono text-xs" onClick={acceptAll}>
            Accept all
          </AccentButton>
        </div>
      </div>
    </div>
  );
}
