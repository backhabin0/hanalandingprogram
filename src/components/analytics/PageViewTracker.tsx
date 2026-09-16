"use client";

import { useEffect, useRef } from "react";
import { trackLandingEvent } from "@/lib/analytics-client";

/**
 * Renders nothing — fires one `page_view` ping after the public page has
 * actually mounted in the browser. Rendered once from `LandingPageRenderer`
 * (shared by every Template), so `/preview/template-*` pages — which render
 * `<TemplateA>` etc. directly, never through `LandingPageRenderer` — never
 * get counted, with no special-casing needed here.
 *
 * `firedRef` guards against React 18 Strict Mode's dev-only double effect
 * invocation on the same mount (mount -> effect -> cleanup -> effect again)
 * firing two pings for one page load. This is NOT a "one visitor, one
 * page_view, ever" guarantee — a real reload is a new page_view, and that's
 * fine; these numbers are directional, not a certified unique-visitor count.
 */
export function PageViewTracker({ slug }: { slug: string }) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    trackLandingEvent({ slug, eventType: "page_view" });
  }, [slug]);

  return null;
}
