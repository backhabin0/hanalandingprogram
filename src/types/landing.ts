/**
 * Core domain types for the landing page CMS.
 *
 * Stage 2 connects these to a real Supabase schema
 * (`supabase/migrations/001_create_landing_page_schema.sql`) via the query
 * helpers in `src/lib/landing-pages.ts`. Field names stay camelCase here;
 * the DB uses snake_case columns, and the helpers translate between them.
 */

export type LandingTemplateId = "template-a" | "template-b" | "template-c";

/**
 * Matches the DB's `status` CHECK constraint exactly (`public` | `private`).
 * Stage 1 used a three-state published/draft/archived model — collapsed to
 * two states here to match the schema (see Stage 2 report for rationale).
 */
export type LandingPageStatus = "public" | "private";

export type ConsultationStatus = "new" | "contacted" | "closed";

/** A single representative price shown near the hero / pricing section. */
export interface LandingPriceSummary {
  /** e.g. "대표 가격", "월 이용료" */
  label?: string;
  /** e.g. "158만원부터", "월 49,000원", "1588-0000 상담" */
  price?: string;
  /** e.g. "부터", "/월", "VAT 별도" */
  priceUnit?: string;
  /** e.g. "설치 환경에 따라 별도 견적이 제공됩니다." */
  description?: string;
}

/** Which schema.org type a product-table row should be announced as. */
export type LandingItemType = "product" | "service";

/** One product or service line item inside a landing page. */
export interface LandingProduct {
  id: string;
  name: string;
  shortDescription: string;
  /** Long-form body copy — real HTML text for SEO, not an image. */
  description: string;
  image?: string;
  /** e.g. "정가" / "프로모션가" — maps to db `price_label`. */
  priceLabel?: string;
  price?: string;
  priceUnit?: string;
  priceNote?: string;
  ctaText?: string;
  sortOrder: number;
  /** Soft-hide without deleting. Defaults to true; DB-sourced data only. */
  isActive?: boolean;
  /** Drives Product vs Service JSON-LD. Undefined (pre-Stage-8 rows) is treated as "product". */
  itemType?: LandingItemType;
}

/** A single differentiator / feature card. */
export interface LandingFeature {
  id: string;
  title: string;
  description: string;
  /** Icon key/emoji placeholder — real icon system arrives later. */
  icon?: string;
  sortOrder: number;
  isActive?: boolean;
}

/** A track-record number, e.g. "설치 건수 1,200+". */
export interface LandingMetric {
  id: string;
  label: string;
  value: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

/** A key/value spec row, optionally grouped (e.g. "카메라", "저장장치"). */
export interface LandingSpecification {
  id: string;
  key: string;
  value: string;
  groupName?: string;
  sortOrder: number;
  /** Set when the spec belongs to one product rather than the whole page. */
  productId?: string;
  isActive?: boolean;
}

/** One FAQ entry — rendered as real HTML for AEO. */
export interface LandingFaq {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive?: boolean;
}

/** A single process/procedure step, e.g. "상담 → 현장 실측 → 설치 → 사후관리". */
export interface LandingProcessStep {
  id: string;
  step: number;
  title: string;
  description: string;
  sortOrder?: number;
  isActive?: boolean;
}

/** Legal/footer-only company details — kept separate from the public page's
 * core business_name/address/phone, which live directly on LandingPage. */
export interface LandingCompanyInfo {
  companyName?: string;
  representative?: string;
  businessRegistrationNumber?: string;
  establishedYear?: string;
  email?: string;
  customerCenter?: string;
  businessHours?: string;
  /** Supplementary/legal address, distinct from LandingPage.address. */
  address?: string;
  footerDescription?: string;
}

export interface LandingSeoMeta {
  metaTitle?: string;
  metaDescription?: string;
  /** Legacy free-form keyword list — kept for schema compatibility, never rendered as a meta keywords tag. */
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  noindex?: boolean;
  businessCategory?: string;
  serviceArea?: string;
  /** Content-guide only (title/body quality checks, duplicate-keyword warnings) — never rendered as a meta keywords tag. */
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  /** Free-text admin note, e.g. "local_service" — not validated against an enum. */
  searchIntent?: string;
  /** Real sentence describing the service area — shown in on-page HTML, not just metadata. */
  localityDescription?: string;
}

/** One install/service case study — local-SEO content depth. */
export interface LandingCase {
  id: string;
  title: string;
  description?: string;
  region?: string;
  industry?: string;
  /** ISO date string (yyyy-mm-dd), if provided. */
  caseDate?: string;
  imageUrl?: string;
  /** Set when this case is about one specific product/service. */
  productId?: string;
  sortOrder: number;
  isActive?: boolean;
}

/**
 * Full landing page record. In Stage 2 this becomes the shape of the
 * `landing_pages` row (with child tables joined in for products/features/etc).
 */
export interface LandingPage {
  id: string;
  businessName: string;
  title: string;
  slug: string;
  template: LandingTemplateId;
  status: LandingPageStatus;

  heroTitle: string;
  heroDescription: string;
  /** Longer intro/about copy for the company — real SEO body text. */
  description: string;

  phone?: string;
  kakaoUrl?: string;
  address?: string;
  /** GEO: plain-language region, e.g. "서울 강남구". */
  region?: string;
  /** GEO: plain-language industry/category, e.g. "CCTV 설치 및 보안 솔루션". */
  industry?: string;

  representativePrice?: LandingPriceSummary;

  logoUrl?: string;
  mainImageUrl?: string;

  products: LandingProduct[];
  features: LandingFeature[];
  metrics: LandingMetric[];
  specifications: LandingSpecification[];
  faqs: LandingFaq[];
  processSteps: LandingProcessStep[];
  /** Undefined on pre-Stage-8 callers (e.g. mock/preview data) — treat as no cases. */
  cases?: LandingCase[];

  /** Short trust labels, e.g. "정보보호 인증", "10년 연속 무사고 시공". */
  trustBadges?: string[];
  companyInfo?: LandingCompanyInfo;
  seo?: LandingSeoMeta;

  createdAt: string;
  updatedAt: string;
}

/** Lightweight row shape for the admin pages list table. */
export type LandingPageSummary = Pick<
  LandingPage,
  "id" | "businessName" | "title" | "slug" | "template" | "status" | "createdAt" | "updatedAt"
>;

/**
 * Shape of a single `landing_pages` row on its own, camelCased, with no
 * child tables joined in. What `getLandingPageById` / `getLandingPageBySlug`
 * return — use `getLandingPageFullBySlug` when you need everything.
 */
export type LandingPageRecord = Omit<
  LandingPage,
  "products" | "features" | "metrics" | "specifications" | "faqs" | "processSteps" | "companyInfo" | "seo"
>;

export interface ConsultationRequest {
  id: string;
  landingPageId: string;
  businessName: string;
  customerName: string;
  phone: string;
  message?: string;
  status: ConsultationStatus;
  createdAt: string;
}

export interface TemplateMeta {
  id: LandingTemplateId;
  name: string;
  nameEn: string;
  purpose: string;
  description: string;
  recommendedFor: string[];
  keySections: string[];
  visualDirection: string;
  accentColor: string;
}
