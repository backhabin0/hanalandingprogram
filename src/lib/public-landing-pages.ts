import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import {
  mapCaseRow,
  mapCompanyInfoRow,
  mapFaqRow,
  mapFeatureRow,
  mapGalleryImageRow,
  mapMetricRow,
  mapPageRow,
  mapProcessStepRow,
  mapProductImageRow,
  mapProductRow,
  mapSeoSettingsRow,
  mapSpecificationRow,
} from "@/lib/landing-pages";
import type { LandingPage, LandingProduct } from "@/types/landing";

/**
 * Public-only reads for the `/[slug]` route.
 *
 * Deliberately separate from `src/lib/landing-pages.ts`'s admin helpers:
 * `createSupabaseServerClient()` carries whatever auth cookie is on the
 * request, and `002_auth_rls.sql` grants `authenticated` a `for all
 * using(true)` policy on every one of these tables. That means an admin
 * browsing `/[slug]` while logged in would have a private page's row (and
 * its children) pass RLS. Every query here re-applies the public-visibility
 * rule in the query itself (`status = 'public'`, `is_active = true`) so the
 * result is the same regardless of who is holding the session cookie — RLS
 * is the first defense, this filter is the second.
 */

const CHILD_ORDER = { ascending: true } as const;

type LandingPageRow = Database["public"]["Tables"]["landing_pages"]["Row"];
type LandingProductRow = Database["public"]["Tables"]["landing_products"]["Row"];
type LandingFeatureRow = Database["public"]["Tables"]["landing_features"]["Row"];
type LandingMetricRow = Database["public"]["Tables"]["landing_metrics"]["Row"];
type LandingSpecificationRow = Database["public"]["Tables"]["landing_specifications"]["Row"];
type LandingFaqRow = Database["public"]["Tables"]["landing_faqs"]["Row"];
type LandingProcessStepRow = Database["public"]["Tables"]["landing_process_steps"]["Row"];
type LandingCompanyInfoRow = Database["public"]["Tables"]["landing_company_info"]["Row"];
type LandingSeoSettingsRow = Database["public"]["Tables"]["landing_page_seo_settings"]["Row"];
type LandingCaseRow = Database["public"]["Tables"]["landing_cases"]["Row"];
type LandingProductImageRow = Database["public"]["Tables"]["landing_product_images"]["Row"];
type LandingGalleryImageRow = Database["public"]["Tables"]["landing_gallery_images"]["Row"];

/**
 * A real Supabase/PostgREST failure (network, malformed query, etc.) is
 * never shown to the visitor — log the diagnostic server-side and throw a
 * sanitized error so it can't leak table/column names or query internals.
 */
function failLoad(context: string, error: { code?: string; message: string }): never {
  console.error(`[public-landing-pages] ${context} failed:`, error.code, error.message);
  throw new Error("공개 페이지를 불러오는 중 문제가 발생했습니다.");
}

async function getPublicLandingPageBySlug(slug: string): Promise<LandingPageRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("landing_pages")
    .select("*")
    .eq("slug", slug)
    .eq("status", "public")
    .maybeSingle();

  if (error) failLoad("landing_pages", error);
  return data;
}

async function getPublicProducts(landingPageId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("landing_products")
    .select("*")
    .eq("landing_page_id", landingPageId)
    .eq("is_active", true)
    .order("sort_order", CHILD_ORDER)
    .order("created_at", CHILD_ORDER);

  if (error) failLoad("landing_products", error);
  return ((data ?? []) as LandingProductRow[]).map(mapProductRow);
}

async function getPublicFeatures(landingPageId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("landing_features")
    .select("*")
    .eq("landing_page_id", landingPageId)
    .eq("is_active", true)
    .order("sort_order", CHILD_ORDER)
    .order("created_at", CHILD_ORDER);

  if (error) failLoad("landing_features", error);
  return ((data ?? []) as LandingFeatureRow[]).map(mapFeatureRow);
}

async function getPublicMetrics(landingPageId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("landing_metrics")
    .select("*")
    .eq("landing_page_id", landingPageId)
    .eq("is_active", true)
    .order("sort_order", CHILD_ORDER)
    .order("created_at", CHILD_ORDER);

  if (error) failLoad("landing_metrics", error);
  return ((data ?? []) as LandingMetricRow[]).map(mapMetricRow);
}

async function getPublicSpecifications(landingPageId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("landing_specifications")
    .select("*")
    .eq("landing_page_id", landingPageId)
    .eq("is_active", true)
    .order("sort_order", CHILD_ORDER)
    .order("created_at", CHILD_ORDER);

  if (error) failLoad("landing_specifications", error);
  return ((data ?? []) as LandingSpecificationRow[]).map(mapSpecificationRow);
}

async function getPublicFaqs(landingPageId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("landing_faqs")
    .select("*")
    .eq("landing_page_id", landingPageId)
    .eq("is_active", true)
    .order("sort_order", CHILD_ORDER)
    .order("created_at", CHILD_ORDER);

  if (error) failLoad("landing_faqs", error);
  return ((data ?? []) as LandingFaqRow[]).map(mapFaqRow);
}

async function getPublicProcessSteps(landingPageId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("landing_process_steps")
    .select("*")
    .eq("landing_page_id", landingPageId)
    .eq("is_active", true)
    .order("sort_order", CHILD_ORDER)
    .order("created_at", CHILD_ORDER);

  if (error) failLoad("landing_process_steps", error);
  return ((data ?? []) as LandingProcessStepRow[]).map(mapProcessStepRow);
}

async function getPublicCompanyInfo(landingPageId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("landing_company_info")
    .select("*")
    .eq("landing_page_id", landingPageId)
    .maybeSingle();

  if (error) failLoad("landing_company_info", error);
  return data ? mapCompanyInfoRow(data as LandingCompanyInfoRow) : null;
}

async function getPublicSeoSettings(landingPageId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("landing_page_seo_settings")
    .select("*")
    .eq("landing_page_id", landingPageId)
    .maybeSingle();

  if (error) failLoad("landing_page_seo_settings", error);
  return data ? mapSeoSettingsRow(data as LandingSeoSettingsRow) : null;
}

async function getPublicCases(landingPageId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("landing_cases")
    .select("*")
    .eq("landing_page_id", landingPageId)
    .eq("is_active", true)
    .order("sort_order", CHILD_ORDER)
    .order("created_at", CHILD_ORDER);

  if (error) failLoad("landing_cases", error);
  return ((data ?? []) as LandingCaseRow[]).map(mapCaseRow);
}

async function getPublicProductImages(landingPageId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("landing_product_images")
    .select("*")
    .eq("landing_page_id", landingPageId)
    .eq("is_active", true)
    .order("sort_order", CHILD_ORDER)
    .order("created_at", CHILD_ORDER);

  if (error) failLoad("landing_product_images", error);
  const grouped: Record<string, ReturnType<typeof mapProductImageRow>[]> = {};
  for (const row of (data ?? []) as LandingProductImageRow[]) {
    (grouped[row.product_id] ??= []).push(mapProductImageRow(row));
  }
  return grouped;
}

async function getPublicGalleryImages(landingPageId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("landing_gallery_images")
    .select("*")
    .eq("landing_page_id", landingPageId)
    .eq("is_active", true)
    .order("sort_order", CHILD_ORDER)
    .order("created_at", CHILD_ORDER);

  if (error) failLoad("landing_gallery_images", error);
  return ((data ?? []) as LandingGalleryImageRow[]).map(mapGalleryImageRow);
}

/**
 * Everything the `/[slug]` route needs for one public landing page, or
 * `null` if the slug doesn't exist / isn't public. Wrapped in React `cache`
 * so `generateMetadata` and the page component — both calling this with the
 * same slug in the same request — share one set of queries instead of
 * fetching twice; the cache is per-request only, so an admin publish/
 * unpublish is reflected on the very next request.
 */
export const getPublicLandingPageFullBySlug = cache(
  async (slug: string): Promise<LandingPage | null> => {
    const row = await getPublicLandingPageBySlug(slug);
    if (!row) return null;

    const page = mapPageRow(row as LandingPageRow);

    const [products, features, metrics, specifications, faqs, processSteps, companyInfo, seo, cases, productImagesByProductId, galleryImages] =
      await Promise.all([
        getPublicProducts(page.id),
        getPublicFeatures(page.id),
        getPublicMetrics(page.id),
        getPublicSpecifications(page.id),
        getPublicFaqs(page.id),
        getPublicProcessSteps(page.id),
        getPublicCompanyInfo(page.id),
        getPublicSeoSettings(page.id),
        getPublicCases(page.id),
        getPublicProductImages(page.id),
        getPublicGalleryImages(page.id),
      ]);

    const productsWithImages: LandingProduct[] = products.map((product) => ({
      ...product,
      images: productImagesByProductId[product.id] ?? [],
    }));

    return {
      ...page,
      products: productsWithImages,
      features,
      metrics,
      specifications,
      faqs,
      processSteps,
      companyInfo: companyInfo ?? undefined,
      seo: seo ?? undefined,
      cases,
      galleryImages,
    };
  }
);

/**
 * The minimal lookup both `createConsultationRequestAction` (Stage 11) and
 * `POST /api/analytics` (Stage 12) need: confirms the slug is a real,
 * currently-public page, lists which product ids are valid to attach a
 * consultation/event to (active products of that page only), and carries
 * `businessName` + each product's `name`/`itemType` so the Stage 11
 * notification email can be built without a second, anon-SELECT-requiring
 * round trip. Deliberately not the full `getPublicLandingPageFullBySlug` —
 * that fetches every child table (FAQs, specs, gallery, ...) neither caller
 * needs, on every form submission / analytics ping.
 */
export async function getPublicLandingPageContext(slug: string): Promise<{
  id: string;
  businessName: string;
  products: { id: string; name: string; itemType: LandingProduct["itemType"] }[];
} | null> {
  const row = await getPublicLandingPageBySlug(slug);
  if (!row) return null;

  const products = await getPublicProducts(row.id);
  return {
    id: row.id,
    businessName: row.business_name,
    products: products.map((p) => ({ id: p.id, name: p.name, itemType: p.itemType })),
  };
}
