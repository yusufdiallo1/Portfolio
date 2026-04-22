"use client";

import { useEffect, useRef } from "react";

import { hasAnalyticsConsent, track } from "@/lib/analytics";

/** Fires page_view once when analytics cookies are accepted (or already stored). */
export function PortfolioPageView() {
  const fired = useRef(false);

  useEffect(() => {
    function tryTrack() {
      if (fired.current) return;
      if (!hasAnalyticsConsent()) return;
      fired.current = true;
      void track("page_view", { path: "/" });
    }

    tryTrack();
    window.addEventListener("cookie-consent-changed", tryTrack);
    return () => window.removeEventListener("cookie-consent-changed", tryTrack);
  }, []);

  return null;
}
