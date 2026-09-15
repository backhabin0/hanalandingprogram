import type { LandingFaq, LandingItemType, LandingPage, LandingProduct } from "@/types/landing";
import type { ResolvedSeo } from "./resolve";
import { absoluteUrl } from "./site-url";

/**
 * This CMS currently only serves Korean businesses (Korean-language admin
 * UI, 원/만원-formatted prices, Korean address/phone conventions) — that is
 * the explicit, documented source for defaulting Offer.priceCurrency to
 * KRW. If this project ever serves a non-Korean business, this constant is
 * the one place that needs a real per-page currency field before it can be
 * trusted; nothing here infers currency from free-text price strings.
 */
const PLATFORM_CURRENCY = "KRW";

/**
 * Escapes a JSON string for safe embedding inside `<script type="application/ld+json">`
 * via `dangerouslySetInnerHTML`. Plain `JSON.stringify` would let a value
 * containing the literal text `</script>` close the script tag early and
 * inject arbitrary HTML — this replaces the characters that make that
 * possible with their unicode escapes, which round-trip identically inside
 * a JSON-LD parser.
 */
export function safeJsonLdStringify(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

/**
 * Parses a price string to a number ONLY when it's unambiguous — plain
 * digits, optionally comma-grouped, optionally followed by a bare "원".
 * Anything with a multiplier/qualifier word ("만원", "부터", "월", "별도
 * 견적", ...) is deliberately left unparsed rather than guessed at, per the
 * Stage 8 rule: no invented numeric Offer.price from ambiguous text.
 */
export function parsePriceToNumber(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const withoutCommas = trimmed.replace(/,/g, "");
  const match = /^(\d+)원?$/.exec(withoutCommas);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function buildOffer(price: string | undefined | null): Record<string, unknown> | undefined {
  const numericPrice = parsePriceToNumber(price);
  if (numericPrice === null) return undefined;
  return {
    "@type": "Offer",
    price: numericPrice,
    priceCurrency: PLATFORM_CURRENCY,
  };
}

function buildWebPage(page: LandingPage, seo: ResolvedSeo): Record<string, unknown> {
  const node: Record<string, unknown> = {
    "@type": "WebPage",
    "@id": `${seo.canonical}#webpage`,
    url: seo.canonical,
    name: seo.title,
    description: seo.description,
  };
  if (page.updatedAt) node.dateModified = page.updatedAt;
  if (seo.ogImage) node.primaryImageOfPage = { "@type": "ImageObject", url: seo.ogImage };
  node.about = { "@id": `${seo.canonical}#organization` };
  node.breadcrumb = { "@id": `${seo.canonical}#breadcrumb` };
  return node;
}

/**
 * LocalBusiness when there's enough real address+contact data to justify
 * it, Organization otherwise. Deliberately never derives a validated
 * LocalBusiness subtype (Restaurant, Store, ...) from the free-text
 * `industry` string — an unverified subtype claim is worse than the safe
 * generic type (see Stage 8 report).
 */
function buildOrganizationOrLocalBusiness(page: LandingPage, seo: ResolvedSeo): Record<string, unknown> {
  const address = page.address ?? page.companyInfo?.address;
  const phone = page.phone;
  const isLocalBusiness = Boolean(address && phone);

  const node: Record<string, unknown> = {
    "@type": isLocalBusiness ? "LocalBusiness" : "Organization",
    "@id": `${seo.canonical}#organization`,
    name: page.companyInfo?.companyName ?? page.businessName,
    url: seo.canonical,
  };

  if (page.description) node.description = page.description;
  if (phone) node.telephone = phone;
  if (page.companyInfo?.email) node.email = page.companyInfo.email;
  if (page.logoUrl) node.logo = page.logoUrl;
  if (page.mainImageUrl) node.image = page.mainImageUrl;
  if (page.companyInfo?.establishedYear && /^\d{4}$/.test(page.companyInfo.establishedYear)) {
    node.foundingDate = page.companyInfo.establishedYear;
  }

  if (address) {
    node.address = { "@type": "PostalAddress", streetAddress: address };
  }

  const areaServed = seo.serviceArea || page.region;
  if (areaServed) node.areaServed = areaServed;

  if (phone) {
    node.contactPoint = {
      "@type": "ContactPoint",
      telephone: phone,
      contactType: "customer service",
    };
  }

  return node;
}

function buildBreadcrumb(page: LandingPage, seo: ResolvedSeo): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    "@id": `${seo.canonical}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: page.businessName, item: seo.canonical },
    ],
  };
}

function resolveItemType(product: LandingProduct): LandingItemType {
  return product.itemType === "service" ? "service" : "product";
}

function buildProductOrServiceNode(product: LandingProduct, page: LandingPage, seo: ResolvedSeo): Record<string, unknown> {
  const itemType = resolveItemType(product);
  const offer = buildOffer(product.price);

  if (itemType === "service") {
    const node: Record<string, unknown> = {
      "@type": "Service",
      name: product.name,
      areaServed: seo.serviceArea || page.region || undefined,
      provider: { "@id": `${seo.canonical}#organization` },
    };
    if (product.description || product.shortDescription) {
      node.description = product.description || product.shortDescription;
    }
    if (offer) node.offers = offer;
    return node;
  }

  const node: Record<string, unknown> = { "@type": "Product", name: product.name };
  if (product.description || product.shortDescription) {
    node.description = product.description || product.shortDescription;
  }
  if (product.image) node.image = product.image;
  if (offer) node.offers = offer;
  return node;
}

function buildFaqPage(faqs: LandingFaq[]): Record<string, unknown> | null {
  const active = faqs.filter((f) => f.isActive !== false && f.question && f.answer);
  if (active.length === 0) return null;

  return {
    "@type": "FAQPage",
    mainEntity: active.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

/**
 * Builds the full set of schema.org nodes for one public landing page as a
 * plain array — Google accepts multiple JSON-LD objects on a page either as
 * separate `<script>` tags or as one top-level array, and a single script
 * keeps the injection point (LandingPageRenderer) to one place shared by
 * every Template. Every node is optional based on what real data exists;
 * nothing here fabricates a field the DB doesn't have.
 */
export function buildLandingPageJsonLd(page: LandingPage, seo: ResolvedSeo): Record<string, unknown>[] {
  const nodes: Record<string, unknown>[] = [
    { "@context": "https://schema.org", ...buildWebPage(page, seo) },
    { "@context": "https://schema.org", ...buildOrganizationOrLocalBusiness(page, seo) },
    { "@context": "https://schema.org", ...buildBreadcrumb(page, seo) },
  ];

  const activeProducts = page.products.filter((p) => p.isActive !== false);
  for (const product of activeProducts) {
    nodes.push({ "@context": "https://schema.org", ...buildProductOrServiceNode(product, page, seo) });
  }

  const faqPage = buildFaqPage(page.faqs);
  if (faqPage) nodes.push({ "@context": "https://schema.org", ...faqPage });

  return nodes;
}
