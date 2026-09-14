/**
 * Hand-authored types mirroring `supabase/migrations/001_create_landing_page_schema.sql`.
 *
 * Only `Row` shapes are defined — Stage 2 ships read-only query helpers, so
 * `Insert`/`Update` types aren't needed yet. Once the project is live and
 * write helpers are built, this file can be replaced wholesale with
 * `npx supabase gen types typescript --project-id <id>` output; keep the
 * table/column names in sync with the migration until then.
 */

export interface Database {
  public: {
    Tables: {
      landing_pages: {
        Row: {
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
      };
      landing_products: {
        Row: {
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
          created_at: string;
          updated_at: string;
        };
      };
      landing_features: {
        Row: {
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
      };
      landing_metrics: {
        Row: {
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
      };
      landing_specifications: {
        Row: {
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
      };
      landing_faqs: {
        Row: {
          id: string;
          landing_page_id: string;
          question: string;
          answer: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      landing_process_steps: {
        Row: {
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
      };
      landing_company_info: {
        Row: {
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
      };
      landing_page_seo_settings: {
        Row: {
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
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}
