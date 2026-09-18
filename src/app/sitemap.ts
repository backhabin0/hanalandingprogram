import type { MetadataRoute } from "next";
import { unstable_rethrow } from "next/navigation";
import { getSiteUrl } from "@/lib/seo/site-url";
import { getPublicSitemapEntries } from "@/lib/public-landing-pages";

/**
 * Stage 13: `/sitemap.xml`. Always built against `NEXT_PUBLIC_SITE_URL`
 * (the apex `hanapage.co.kr`, never `www.`/`*.vercel.app`/`localhost`) via
 * `getSiteUrl()` — the same base every canonical/OG URL already uses.
 *
 * `getPublicSitemapEntries()` reads through `createSupabaseServerClient()`,
 * which calls `cookies()` — a Request-time API — so Next.js already treats
 * this route as dynamic (no explicit `dynamic`/`revalidate` export needed);
 * a page published/unpublished in the admin is reflected on the next crawl.
 *
 * A transient Supabase failure here must not turn `/sitemap.xml` into an
 * uncaught 500, nor silently ship an empty sitemap that would tell search
 * engines to drop every known URL. On failure this logs server-side and
 * falls back to just the home entry (the one URL that needs no DB read) —
 * degraded, but never wrong.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();

  const homeEntry: MetadataRoute.Sitemap[number] = {
    url: baseUrl,
    changeFrequency: "weekly",
    priority: 1,
  };

  let entries: { slug: string; updatedAt: string }[] = [];
  try {
    entries = await getPublicSitemapEntries();
  } catch (err) {
    // `getPublicSitemapEntries` reads through `cookies()`, which — outside
    // an actual request (e.g. `next build`'s static-shell attempt) — throws
    // Next's own internal "needs dynamic rendering" signal, not a real
    // failure. That must be rethrown and handled by Next itself, never
    // treated as a Supabase outage; only a genuine DB/network error should
    // fall through to the degraded (home-only) sitemap below.
    unstable_rethrow(err);
    console.error("[sitemap] failed to load public landing pages:", err instanceof Error ? err.message : "unknown");
  }

  const pageEntries: MetadataRoute.Sitemap = entries.map((entry) => ({
    url: `${baseUrl}/${entry.slug}`,
    lastModified: new Date(entry.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [homeEntry, ...pageEntries];
}
