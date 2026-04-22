/**
 * Client-side analytics — fire-and-forget, never blocks UI.
 */

export type AnalyticsEvent = {
  name: string;
  properties?: Record<string, string | number | boolean | null>;
};

const CONSENT_KEY = "cookie_consent";

export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(CONSENT_KEY) === "accepted";
}

/** Legacy helper used by existing components */
export function trackEvent(event: AnalyticsEvent) {
  void track(event.name, event.properties ?? undefined);
}

/** Primary tracking call */
export async function track(event: string, metadata?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, metadata }),
    });
  } catch {
    // silent — never block UI
  }
}
