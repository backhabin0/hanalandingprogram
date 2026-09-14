import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type {
  LandingCompanyInfo,
  LandingFaq,
  LandingFeature,
  LandingMetric,
  LandingPage,
  LandingPageRecord,
  LandingPageStatus,
  LandingPageSummary,
  LandingPriceSummary,
  LandingProcessStep,
  LandingProduct,
  LandingSeoMeta,
  LandingSpecification,
  LandingTemplateId,
} from "@/types/landing";

/**
 * Read-only Supabase query helpers for the landing page schema
 * (`supabase/migrations/001_create_landing_page_schema.sql`).
 *
 * Stage 2 scope only: no create/update/delete here, and nothing in the app
 * calls these yet — `/admin/*` and `/preview/*` still render from
 * `src/lib/mock-data.ts`. These exist so DB connectivity and the schema can
 * be verified end-to-end (see the Stage 2 report's Table Editor test steps)
 * ahead of Stage 3's real CRUD/Auth work.
 *
 * Every row read assumes the DB's CHECK constraints already guarantee
 * `template`/`status` are one of the literal values in their TS unions, so
 * mapping casts those columns directly rather than re-validating them.
 */

type LandingPageRow = Database["public"]["Tables"]["landing_pages"]["Row"];
type LandingProductRow = Database["public"]["Tables"]["landing_products"]["Row"];
type LandingFeatureRow = Database["public"]["Tables"]["landing_features"]["Row"];
type LandingMetricRow = Database["public"]["Tables"]["landing_metrics"]["Row"];
type LandingSpecificationRow = Database["public"]["Tables"]["landing_specifications"]["Row"];
type LandingFaqRow = Database["public"]["Tables"]["landing_faqs"]["Row"];
type LandingProcessStepRow = Database["public"]["Tables"]["landing_process_steps"]["Row"];
type LandingCompanyInfoRow = Database["public"]["Tables"]["landing_company_info"]["Row"];
type LandingSeoSettingsRow = Database["public"]["Tables"]["landing_page_seo_settings"]["Row"];

const CHILD_ORDER = { ascending: true } as const;

// ---------------------------------------------------------------------------
// Row → domain type mappers
// ---------------------------------------------------------------------------

function mapPageRow(row: LandingPageRow): LandingPageRecord {
  const representativePrice: LandingPriceSummary | undefined =
    row.price_label || row.price || row.price_unit || row.price_description
      ? {
          label: row.price_label ?? undefined,
          price: row.price ?? undefined,
          priceUnit: row.price_unit ?? undefined,
          description: row.price_description ?? undefined,
        }
      : undefined;

  return {
    id: row.id,
    businessName: row.business_name,
    title: row.title,
    slug: row.slug,
    template: row.template as LandingTemplateId,
    status: row.status as LandingPageStatus,
    heroTitle: row.hero_title ?? "",
    heroDescription: row.hero_description ?? "",
    description: row.description ?? "",
    phone: row.phone ?? undefined,
    kakaoUrl: row.kakao_url ?? undefined,
    address: row.address ?? undefined,
    region: row.region ?? undefined,
    industry: row.industry ?? undefined,
    representativePrice,
    logoUrl: row.logo_url ?? undefined,
    mainImageUrl: row.main_image_url ?? undefined,
    trustBadges: row.trust_badges ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPageSummaryRow(row: LandingPageRow): LandingPageSummary {
  return {
    id: row.id,
    businessName: row.business_name,
    title: row.title,
    slug: row.slug,
    template: row.template as LandingTemplateId,
    status: row.status as LandingPageStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapProductRow(row: LandingProductRow): LandingProduct {
  return {
    id: row.id,
    name: row.name,
    shortDescription: row.short_description ?? "",
    description: row.description ?? "",
    image: row.image_url ?? undefined,
    priceLabel: row.price_label ?? undefined,
    price: row.price ?? undefined,
    priceUnit: row.price_unit ?? undefined,
    priceNote: row.price_description ?? undefined,
    ctaText: row.cta_text ?? undefined,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

function mapFeatureRow(row: LandingFeatureRow): LandingFeature {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    icon: row.icon ?? undefined,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

function mapMetricRow(row: LandingMetricRow): LandingMetric {
  return {
    id: row.id,
    label: row.label,
    value: row.value,
    description: row.description ?? undefined,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

function mapSpecificationRow(row: LandingSpecificationRow): LandingSpecification {
  return {
    id: row.id,
    key: row.spec_key,
    value: row.spec_value,
    groupName: row.group_name ?? undefined,
    sortOrder: row.sort_order,
    productId: row.product_id ?? undefined,
    isActive: row.is_active,
  };
}

function mapFaqRow(row: LandingFaqRow): LandingFaq {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

function mapProcessStepRow(row: LandingProcessStepRow): LandingProcessStep {
  return {
    id: row.id,
    step: row.step_number ?? row.sort_order,
    title: row.title,
    description: row.description ?? "",
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

function mapCompanyInfoRow(row: LandingCompanyInfoRow): LandingCompanyInfo {
  return {
    companyName: row.company_name ?? undefined,
    representative: row.representative_name ?? undefined,
    businessRegistrationNumber: row.business_number ?? undefined,
    establishedYear: row.established_year ?? undefined,
    email: row.email ?? undefined,
    customerCenter: row.customer_center ?? undefined,
    businessHours: row.business_hours ?? undefined,
    address: row.address_detail ?? undefined,
    footerDescription: row.footer_description ?? undefined,
  };
}

function mapSeoSettingsRow(row: LandingSeoSettingsRow): LandingSeoMeta {
  return {
    metaTitle: row.seo_title ?? undefined,
    metaDescription: row.seo_description ?? undefined,
    keywords: row.keywords ?? undefined,
    ogTitle: row.og_title ?? undefined,
    ogDescription: row.og_description ?? undefined,
    ogImageUrl: row.og_image_url ?? undefined,
    noindex: row.seo_noindex,
    businessCategory: row.business_category ?? undefined,
    serviceArea: row.service_area ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Base landing_pages reads
// ---------------------------------------------------------------------------

/** List rows for the admin pages table. Newest first. */
export async function getLandingPages(): Promise<LandingPageSummary[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("landing_pages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapPageSummaryRow);
}

export async function getLandingPageById(id: string): Promise<LandingPageRecord | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("landing_pages").select("*").eq("id", id).maybeSingle();

  if (error) throw error;
  return data ? mapPageRow(data) : null;
}

export async function getLandingPageBySlug(slug: string): Promise<LandingPageRecord | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("landing_pages").select("*").eq("slug", slug).maybeSingle();

  if (error) throw error;
  return data ? mapPageRow(data) : null;
}

// ---------------------------------------------------------------------------
// Child table reads (all scoped to one landing_page_id, sort_order then
// created_at ascending)
// ---------------------------------------------------------------------------

export async function getLandingProducts(landingPageId: string): Promise<LandingProduct[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("landing_products")
    .select("*")
    .eq("landing_page_id", landingPageId)
    .order("sort_order", CHILD_ORDER)
    .order("created_at", CHILD_ORDER);

  if (error) throw error;
  return (data ?? []).map(mapProductRow);
}

export async function getLandingFeatures(landingPageId: string): Promise<LandingFeature[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("landing_features")
    .select("*")
    .eq("landing_page_id", landingPageId)
    .order("sort_order", CHILD_ORDER)
    .order("created_at", CHILD_ORDER);

  if (error) throw error;
  return (data ?? []).map(mapFeatureRow);
}

export async function getLandingMetrics(landingPageId: string): Promise<LandingMetric[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("landing_metrics")
    .select("*")
    .eq("landing_page_id", landingPageId)
    .order("sort_order", CHILD_ORDER)
    .order("created_at", CHILD_ORDER);

  if (error) throw error;
  return (data ?? []).map(mapMetricRow);
}

/**
 * Pass `productId` to fetch specs for one product; omit it to fetch every
 * spec on the page (page-level rows and every product's rows together).
 */
export async function getLandingSpecifications(
  landingPageId: string,
  productId?: string
): Promise<LandingSpecification[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("landing_specifications")
    .select("*")
    .eq("landing_page_id", landingPageId);

  if (productId) {
    query = query.eq("product_id", productId);
  }

  const { data, error } = await query.order("sort_order", CHILD_ORDER).order("created_at", CHILD_ORDER);

  if (error) throw error;
  return (data ?? []).map(mapSpecificationRow);
}

export async function getLandingFaqs(landingPageId: string): Promise<LandingFaq[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("landing_faqs")
    .select("*")
    .eq("landing_page_id", landingPageId)
    .order("sort_order", CHILD_ORDER)
    .order("created_at", CHILD_ORDER);

  if (error) throw error;
  return (data ?? []).map(mapFaqRow);
}

export async function getLandingProcessSteps(landingPageId: string): Promise<LandingProcessStep[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("landing_process_steps")
    .select("*")
    .eq("landing_page_id", landingPageId)
    .order("sort_order", CHILD_ORDER)
    .order("created_at", CHILD_ORDER);

  if (error) throw error;
  return (data ?? []).map(mapProcessStepRow);
}

export async function getLandingCompanyInfo(landingPageId: string): Promise<LandingCompanyInfo | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("landing_company_info")
    .select("*")
    .eq("landing_page_id", landingPageId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapCompanyInfoRow(data) : null;
}

export async function getLandingPageSeoSettings(landingPageId: string): Promise<LandingSeoMeta | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("landing_page_seo_settings")
    .select("*")
    .eq("landing_page_id", landingPageId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapSeoSettingsRow(data) : null;
}

// ---------------------------------------------------------------------------
// Combined fetch
// ---------------------------------------------------------------------------

/**
 * Everything one public landing page needs, assembled into the same
 * `LandingPage` shape the Stage 1 templates already render from mock data.
 * Not wired into any route yet — `/preview/*` still uses mock data — this
 * is here so Stage 3+ can point a real public route at it as a drop-in swap.
 */
export async function getLandingPageFullBySlug(slug: string): Promise<LandingPage | null> {
  const page = await getLandingPageBySlug(slug);
  if (!page) return null;

  const [products, features, metrics, specifications, faqs, processSteps, companyInfo, seo] =
    await Promise.all([
      getLandingProducts(page.id),
      getLandingFeatures(page.id),
      getLandingMetrics(page.id),
      getLandingSpecifications(page.id),
      getLandingFaqs(page.id),
      getLandingProcessSteps(page.id),
      getLandingCompanyInfo(page.id),
      getLandingPageSeoSettings(page.id),
    ]);

  return {
    ...page,
    products,
    features,
    metrics,
    specifications,
    faqs,
    processSteps,
    companyInfo: companyInfo ?? undefined,
    seo: seo ?? undefined,
  };
}
