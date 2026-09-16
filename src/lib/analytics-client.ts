import type { AnalyticsEventType } from "@/types/landing";

/**
 * Fire-and-forget analytics ping — called from public-page Client Component
 * leaves (`TrackedLink`, `PageViewTracker`). Never awaited by the caller,
 * never blocks navigation, never throws: a phone/kakao click must work even
 * if this fails or the network is offline. `keepalive: true` lets the
 * request outlive the page unload that a real tel:/kakao navigation causes.
 */
export function trackLandingEvent(params: {
  slug: string;
  eventType: AnalyticsEventType;
  productId?: string | null;
}): void {
  try {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: params.slug,
        eventType: params.eventType,
        productId: params.productId ?? null,
      }),
      keepalive: true,
    }).catch(() => {
      // Analytics is a secondary concern — a failed request must never
      // surface to the visitor or affect the CTA it was attached to.
    });
  } catch {
    // Defensive: fetch() itself throwing synchronously (e.g. a strict CSP)
    // must still never break the calling CTA.
  }
}
