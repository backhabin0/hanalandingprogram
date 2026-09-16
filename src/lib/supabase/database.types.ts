/**
 * Hand-authored types mirroring `supabase/migrations/001_create_landing_page_schema.sql`.
 *
 * Stage 2 only defined `Row` shapes (read-only query helpers didn't need
 * more). Stage 4 adds `Insert`/`Update` for every table so `.insert()`/
 * `.update()` calls type-check against `createServerClient<Database>` —
 * `@supabase/supabase-js`'s `GenericTable` constraint requires all three
 * (`Row`, `Insert`, `Update`) plus `Relationships` to be present.
 *
 * Once the project is live, this file can be replaced wholesale with
 * `npx supabase gen types typescript --project-id <id>` output; keep the
 * table/column names in sync with the migrations until then.
 */

type LandingPageRow = {
  id: string;
  business_name: string;
  title: string;
  slug: string;
  hero_title: string | null;
  hero_description: string | null;
  description: string | null;
  phone: string | null;
  kakao_url: string | null;
  address: string | null;
  region: string | null;
  industry: string | null;
  template: string;
  status: string;
  logo_url: string | null;
  main_image_url: string | null;
  price_label: string | null;
  price: string | null;
  price_unit: string | null;
  price_description: string | null;
  trust_badges: string[] | null;
  created_at: string;
  updated_at: string;
};
type LandingPageInsert = Pick<LandingPageRow, "business_name" | "title" | "slug"> &
  Partial<Omit<LandingPageRow, "business_name" | "title" | "slug">>;
type LandingPageUpdate = Partial<LandingPageRow>;

type LandingProductRow = {
  id: string;
  landing_page_id: string;
  name: string;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  price_label: string | null;
  price: string | null;
  price_unit: string | null;
  price_description: string | null;
  cta_text: string | null;
  sort_order: number;
  is_active: boolean;
  item_type: string;
  created_at: string;
  updated_at: string;
};
type LandingProductInsert = Pick<LandingProductRow, "landing_page_id" | "name"> &
  Partial<Omit<LandingProductRow, "landing_page_id" | "name">>;
type LandingProductUpdate = Partial<LandingProductRow>;

type LandingFeatureRow = {
  id: string;
  landing_page_id: string;
  title: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
type LandingFeatureInsert = Pick<LandingFeatureRow, "landing_page_id" | "title"> &
  Partial<Omit<LandingFeatureRow, "landing_page_id" | "title">>;
type LandingFeatureUpdate = Partial<LandingFeatureRow>;

type LandingMetricRow = {
  id: string;
  landing_page_id: string;
  label: string;
  value: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
type LandingMetricInsert = Pick<LandingMetricRow, "landing_page_id" | "label" | "value"> &
  Partial<Omit<LandingMetricRow, "landing_page_id" | "label" | "value">>;
type LandingMetricUpdate = Partial<LandingMetricRow>;

type LandingSpecificationRow = {
  id: string;
  landing_page_id: string;
  product_id: string | null;
  group_name: string | null;
  spec_key: string;
  spec_value: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
type LandingSpecificationInsert = Pick<LandingSpecificationRow, "landing_page_id" | "spec_key" | "spec_value"> &
  Partial<Omit<LandingSpecificationRow, "landing_page_id" | "spec_key" | "spec_value">>;
type LandingSpecificationUpdate = Partial<LandingSpecificationRow>;

type LandingFaqRow = {
  id: string;
  landing_page_id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
type LandingFaqInsert = Pick<LandingFaqRow, "landing_page_id" | "question" | "answer"> &
  Partial<Omit<LandingFaqRow, "landing_page_id" | "question" | "answer">>;
type LandingFaqUpdate = Partial<LandingFaqRow>;

type LandingProcessStepRow = {
  id: string;
  landing_page_id: string;
  title: string;
  description: string | null;
  step_number: number | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
type LandingProcessStepInsert = Pick<LandingProcessStepRow, "landing_page_id" | "title"> &
  Partial<Omit<LandingProcessStepRow, "landing_page_id" | "title">>;
type LandingProcessStepUpdate = Partial<LandingProcessStepRow>;

type LandingCompanyInfoRow = {
  landing_page_id: string;
  company_name: string | null;
  representative_name: string | null;
  business_number: string | null;
  established_year: string | null;
  email: string | null;
  customer_center: string | null;
  business_hours: string | null;
  address_detail: string | null;
  footer_description: string | null;
  created_at: string;
  updated_at: string;
};
type LandingCompanyInfoInsert = Pick<LandingCompanyInfoRow, "landing_page_id"> &
  Partial<Omit<LandingCompanyInfoRow, "landing_page_id">>;
type LandingCompanyInfoUpdate = Partial<LandingCompanyInfoRow>;

type LandingSeoSettingsRow = {
  landing_page_id: string;
  seo_title: string | null;
  seo_description: string | null;
  keywords: string[] | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  seo_noindex: boolean;
  business_category: string | null;
  service_area: string | null;
  primary_keyword: string | null;
  secondary_keywords: string[] | null;
  search_intent: string | null;
  locality_description: string | null;
  created_at: string;
  updated_at: string;
};
type LandingSeoSettingsInsert = Pick<LandingSeoSettingsRow, "landing_page_id"> &
  Partial<Omit<LandingSeoSettingsRow, "landing_page_id">>;
type LandingSeoSettingsUpdate = Partial<LandingSeoSettingsRow>;

type LandingCaseRow = {
  id: string;
  landing_page_id: string;
  product_id: string | null;
  title: string;
  description: string | null;
  region: string | null;
  industry: string | null;
  case_date: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
type LandingCaseInsert = Pick<LandingCaseRow, "landing_page_id" | "title"> &
  Partial<Omit<LandingCaseRow, "landing_page_id" | "title">>;
type LandingCaseUpdate = Partial<LandingCaseRow>;

type LandingProductImageRow = {
  id: string;
  landing_page_id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  caption: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
type LandingProductImageInsert = Pick<LandingProductImageRow, "landing_page_id" | "product_id" | "image_url"> &
  Partial<Omit<LandingProductImageRow, "landing_page_id" | "product_id" | "image_url">>;
type LandingProductImageUpdate = Partial<LandingProductImageRow>;

type LandingGalleryImageRow = {
  id: string;
  landing_page_id: string;
  image_url: string;
  alt_text: string | null;
  caption: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
type LandingGalleryImageInsert = Pick<LandingGalleryImageRow, "landing_page_id" | "image_url"> &
  Partial<Omit<LandingGalleryImageRow, "landing_page_id" | "image_url">>;
type LandingGalleryImageUpdate = Partial<LandingGalleryImageRow>;

type ConsultationRequestRow = {
  id: string;
  landing_page_id: string | null;
  product_id: string | null;
  inquiry_type: string;
  name: string;
  phone: string;
  email: string | null;
  company_name: string | null;
  message: string | null;
  preferred_contact: string | null;
  privacy_consent: boolean;
  status: string;
  submission_id: string | null;
  created_at: string;
  updated_at: string;
};
type ConsultationRequestInsert = Pick<ConsultationRequestRow, "name" | "phone" | "privacy_consent"> &
  Partial<Omit<ConsultationRequestRow, "name" | "phone" | "privacy_consent">>;
type ConsultationRequestUpdate = Partial<ConsultationRequestRow>;

export type Database = {
  // Without this marker, @supabase/supabase-js's SupabaseClient generic
  // silently resolves `.insert()`/`.update()` payload types to `never`
  // (confirmed empirically — Row/select typing works fine either way, only
  // Insert/Update are affected). Real `supabase gen types` output always
  // includes this; hand-authored Database types must too.
  __InternalSupabase: {
    PostgrestVersion: "13";
  };
  public: {
    // Required so `public` structurally satisfies the SDK's GenericSchema
    // constraint (Tables + Views + Functions) — without these two, every
    // Schema-dependent generic (including .insert()/.update() payload
    // types) silently collapses to `never`.
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Tables: {
      landing_pages: {
        Row: LandingPageRow;
        Insert: LandingPageInsert;
        Update: LandingPageUpdate;
        Relationships: [];
      };
      landing_products: {
        Row: LandingProductRow;
        Insert: LandingProductInsert;
        Update: LandingProductUpdate;
        Relationships: [];
      };
      landing_features: {
        Row: LandingFeatureRow;
        Insert: LandingFeatureInsert;
        Update: LandingFeatureUpdate;
        Relationships: [];
      };
      landing_metrics: {
        Row: LandingMetricRow;
        Insert: LandingMetricInsert;
        Update: LandingMetricUpdate;
        Relationships: [];
      };
      landing_specifications: {
        Row: LandingSpecificationRow;
        Insert: LandingSpecificationInsert;
        Update: LandingSpecificationUpdate;
        Relationships: [];
      };
      landing_faqs: {
        Row: LandingFaqRow;
        Insert: LandingFaqInsert;
        Update: LandingFaqUpdate;
        Relationships: [];
      };
      landing_process_steps: {
        Row: LandingProcessStepRow;
        Insert: LandingProcessStepInsert;
        Update: LandingProcessStepUpdate;
        Relationships: [];
      };
      landing_company_info: {
        Row: LandingCompanyInfoRow;
        Insert: LandingCompanyInfoInsert;
        Update: LandingCompanyInfoUpdate;
        Relationships: [];
      };
      landing_page_seo_settings: {
        Row: LandingSeoSettingsRow;
        Insert: LandingSeoSettingsInsert;
        Update: LandingSeoSettingsUpdate;
        Relationships: [];
      };
      landing_cases: {
        Row: LandingCaseRow;
        Insert: LandingCaseInsert;
        Update: LandingCaseUpdate;
        Relationships: [];
      };
      landing_product_images: {
        Row: LandingProductImageRow;
        Insert: LandingProductImageInsert;
        Update: LandingProductImageUpdate;
        Relationships: [];
      };
      landing_gallery_images: {
        Row: LandingGalleryImageRow;
        Insert: LandingGalleryImageInsert;
        Update: LandingGalleryImageUpdate;
        Relationships: [];
      };
      consultation_requests: {
        Row: ConsultationRequestRow;
        Insert: ConsultationRequestInsert;
        Update: ConsultationRequestUpdate;
        Relationships: [];
      };
    };
  };
};
