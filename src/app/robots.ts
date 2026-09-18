import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site-url";

/**
 * Stage 13: `/robots.txt`. A crawling hint only — NOT a security boundary.
 * `/admin/*` is already protected by `requireUser()` + RLS (see
 * `src/lib/auth.ts`); the `Disallow` entries below exist so crawlers don't
 * waste budget on pages they could never usefully index, not to hide them.
 *
 * `Host:` is deliberately omitted — it was a Yandex-only, non-standard
 * directive that Yandex itself stopped honoring in 2018, and Google has
 * never supported it. The one line that matters for search engine
 * discovery, `Sitemap:`, is included below.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/login", "/preview/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
