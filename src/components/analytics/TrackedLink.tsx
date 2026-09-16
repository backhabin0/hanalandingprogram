"use client";

import type { ComponentPropsWithoutRef } from "react";
import { trackLandingEvent } from "@/lib/analytics-client";
import type { AnalyticsEventType } from "@/types/landing";

/**
 * A plain `<a>` with one extra thing: fires a fire-and-forget analytics
 * ping on click, then lets the click proceed completely normally. This is
 * the ONLY Client Component boundary needed to add tracking to a
 * phone/kakao/CTA link inside an otherwise-Server-Component section
 * (Hero, LeadSection, LocationSection, ProductSection, PricingSection) —
 * those files stay Server Components; only this leaf is client.
 *
 * Never calls `preventDefault()` and never awaits the tracking call before
 * returning — a `tel:`/kakao navigation must never wait on analytics.
 */
export function TrackedLink({
  slug,
  eventType,
  productId,
  onClick,
  ...anchorProps
}: ComponentPropsWithoutRef<"a"> & {
  slug: string;
  eventType: AnalyticsEventType;
  productId?: string | null;
}) {
  return (
    <a
      {...anchorProps}
      onClick={(e) => {
        trackLandingEvent({ slug, eventType, productId });
        onClick?.(e);
      }}
    />
  );
}
