import type { LandingSeoMeta } from "@/types/landing";
import { absoluteUrl } from "./site-url";

/**
 * Everything the resolver needs — deliberately narrower than the full
 * `LandingPage` type so the admin edit page can compute a live preview from
 * data it already has in memory (no extra DB round-trip), and the public
 * route can pass its already-fetched `LandingPage` as-is.
 */
export interface SeoResolverInput {
  slug: string;
  businessName: string;
  title: string;
  heroTitle: string;
  heroDescription: string;
  description: string;
  region?: string;
  industry?: string;
  mainImageUrl?: string;
  logoUrl?: string;
  updatedAt?: string;
  /** Only names are used — no product data is invented if this is empty. */
  products?: { name: string; isActive?: boolean }[];
  seo?: LandingSeoMeta;
}

export interface ResolvedSeo {
  /** Manual seo_title if set, else the best auto candidate. */
  title: string;
  /** Manual seo_description if set, else the best auto candidate. */
  description: string;
  /** Always the auto candidate, ignoring any manual override — for admin preview. */
  autoTitle: string;
  /** Always the auto candidate, ignoring any manual override — for admin preview. */
  autoDescription: string;
  titleSource: "manual" | "auto";
  descriptionSource: "manual" | "auto";
  canonical: string;
  robots: { index: boolean; follow: boolean };
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
  twitterCard: "summary" | "summary_large_image";
  primaryKeyword?: string;
  serviceArea?: string;
  localityDescription?: string;
}

/**
 * SEO title auto-generation. Uses only fields that exist in the DB — never
 * invents a service/product/region that isn't actually on the page.
 *
 * Priority for the "locale phrase" half: region + industry (both real DB
 * columns) is the strongest local-SEO signal available; short of that it
 * falls back to whatever manually-curated `title`/`heroTitle` the admin
 * already wrote for Stage 1-7.
 */
function computeAutoTitle(input: SeoResolverInput): string {
  const localePart = [input.region, input.industry].filter(Boolean).join(" ").trim();
  if (localePart) {
    return `${localePart} | ${input.businessName}`;
  }
  if (input.title?.trim()) return input.title.trim();
  if (input.heroTitle?.trim()) return `${input.heroTitle.trim()} | ${input.businessName}`;
  return input.businessName;
}

/**
 * Meta description auto-generation. Order matches the Stage 8 spec exactly:
 * existing about copy first, then a locale+industry+product sentence built
 * only from fields that are actually present, then a bare fallback.
 */
function computeAutoDescription(input: SeoResolverInput): string {
  if (input.description?.trim()) return input.description.trim();
  if (input.heroDescription?.trim()) return input.heroDescription.trim();

  const activeProducts = (input.products ?? []).filter((p) => p.isActive !== false);
  const representativeProduct = activeProducts[0]?.name;

  const parts: string[] = [];
  if (input.region || input.industry) {
    parts.push([input.region, input.industry].filter(Boolean).join(" "));
  }
  if (representativeProduct) {
    parts.push(`대표 서비스: ${representativeProduct}`);
  }
  if (parts.length > 0) {
    return `${input.businessName} — ${parts.join(", ")}.`;
  }

  return `${input.businessName} 공식 안내 페이지입니다.`;
}

/**
 * Single source of truth for every SEO fallback rule — the public route's
 * `generateMetadata`, the JSON-LD builder, and the admin preview all call
 * this instead of each keeping their own copy (Stage 8 requirement: no
 * divergent fallback logic between Template rendering and metadata).
 */
export function resolveLandingPageSeo(input: SeoResolverInput): ResolvedSeo {
  const autoTitle = computeAutoTitle(input);
  const autoDescription = computeAutoDescription(input);

  const manualTitle = input.seo?.metaTitle?.trim();
  const manualDescription = input.seo?.metaDescription?.trim();

  const title = manualTitle || autoTitle;
  const description = manualDescription || autoDescription;

  const noindex = Boolean(input.seo?.noindex);

  const ogImage = input.seo?.ogImageUrl?.trim() || input.mainImageUrl?.trim() || input.logoUrl?.trim() || undefined;

  return {
    title,
    description,
    autoTitle,
    autoDescription,
    titleSource: manualTitle ? "manual" : "auto",
    descriptionSource: manualDescription ? "manual" : "auto",
    canonical: absoluteUrl(`/${input.slug}`),
    robots: { index: !noindex, follow: !noindex },
    ogTitle: input.seo?.ogTitle?.trim() || title,
    ogDescription: input.seo?.ogDescription?.trim() || description,
    ogImage,
    twitterCard: ogImage ? "summary_large_image" : "summary",
    primaryKeyword: input.seo?.primaryKeyword?.trim() || undefined,
    serviceArea: input.seo?.serviceArea?.trim() || undefined,
    localityDescription: input.seo?.localityDescription?.trim() || undefined,
  };
}
