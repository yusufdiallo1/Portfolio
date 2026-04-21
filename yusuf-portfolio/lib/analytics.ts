/**
 * Client or server helpers for analytics (e.g. page views, events).
 * Wire to your provider or POST /api/analytics.
 */

export type AnalyticsEvent = {
  name: string;
  properties?: Record<string, string | number | boolean | null>;
};

export function trackEvent(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;
  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  }).catch(() => {});
}
