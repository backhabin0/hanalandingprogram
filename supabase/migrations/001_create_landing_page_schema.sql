-- =============================================================================
-- 001_create_landing_page_schema.sql
--
-- Stage 2: core relational schema for the landing page CMS.
--
-- One landing_pages row fans out into several optional child tables
-- (products, features, metrics, specifications, faqs, process steps) plus
-- two 1:1 detail tables (company info, SEO settings). Nothing here wires up
-- application CRUD yet — this migration only creates the schema.
--
-- Run this in: Supabase Dashboard → SQL Editor → paste → Run.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. landing_pages (parent table)
-- -----------------------------------------------------------------------------
create table if not exists landing_pages (
  id uuid primary key default gen_random_uuid(),

  business_name text not null,
  title text not null,
  slug text not null unique,

  -- Hero H1 / supporting copy, distinct from the page's <title> / description.
  hero_title text,
  hero_description text,
  description text,

  phone text,
  kakao_url text,
  address text,
  -- GEO: plain-language region/industry, used by Hero, LocationSection, Footer.
  region text,
  industry text,

  template text not null default 'template-a'
    check (template in ('template-a', 'template-b', 'template-c')),
  status text not null default 'private'
    check (status in ('public', 'private')),

  logo_url text,
  main_image_url text,

  -- Representative price shown near Hero/Pricing. Text, not numeric — real
  -- values are as free-form as "158만원부터", "월 49,000원", "별도 견적".
  price_label text,
  price text,
  price_unit text,
  price_description text,

  -- Short trust labels (e.g. "10년 연속 무사고 시공"). Simple unstructured
  -- strings with no ordering/icon of their own, so a plain array is enough —
  -- doesn't warrant its own child table.
  trust_badges text[],

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table landing_pages is 'One row per landing page (parent of all landing_* child tables).';

-- -----------------------------------------------------------------------------
-- 2. landing_products (products AND services — no item_type split; current
--    templates render both uniformly and no consumer needs the distinction
--    yet, so it's deliberately omitted to avoid an unused column)
-- -----------------------------------------------------------------------------
create table if not exists landing_products (
  id uuid primary key default gen_random_uuid(),
  landing_page_id uuid not null references landing_pages(id) on delete cascade,

  name text not null,
  short_description text,
  description text,
  image_url text,

  price_label text,
  price text,
  price_unit text,
  price_description text,
  cta_text text,

  sort_order integer not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 3. landing_features
-- -----------------------------------------------------------------------------
create table if not exists landing_features (
  id uuid primary key default gen_random_uuid(),
  landing_page_id uuid not null references landing_pages(id) on delete cascade,

  title text not null,
  description text,
  icon text,

  sort_order integer not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 4. landing_metrics
-- -----------------------------------------------------------------------------
create table if not exists landing_metrics (
  id uuid primary key default gen_random_uuid(),
  landing_page_id uuid not null references landing_pages(id) on delete cascade,

  label text not null,
  value text not null,
  description text,

  sort_order integer not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 5. landing_specifications
--    product_id null  -> page-level / representative-product spec
--    product_id set   -> spec belongs to that specific product
-- -----------------------------------------------------------------------------
create table if not exists landing_specifications (
  id uuid primary key default gen_random_uuid(),
  landing_page_id uuid not null references landing_pages(id) on delete cascade,
  product_id uuid references landing_products(id) on delete cascade,

  group_name text,
  spec_key text not null,
  spec_value text not null,

  sort_order integer not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 6. landing_faqs
-- -----------------------------------------------------------------------------
create table if not exists landing_faqs (
  id uuid primary key default gen_random_uuid(),
  landing_page_id uuid not null references landing_pages(id) on delete cascade,

  question text not null,
  answer text not null,

  sort_order integer not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 7. landing_process_steps
-- -----------------------------------------------------------------------------
create table if not exists landing_process_steps (
  id uuid primary key default gen_random_uuid(),
  landing_page_id uuid not null references landing_pages(id) on delete cascade,

  title text not null,
  description text,
  step_number integer,

  sort_order integer not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 8. landing_company_info (1:1 with landing_pages)
--    business_name / address / phone stay on landing_pages (public page
--    data); this table holds legal/footer-only company details.
-- -----------------------------------------------------------------------------
create table if not exists landing_company_info (
  landing_page_id uuid primary key references landing_pages(id) on delete cascade,

  company_name text,
  representative_name text,
  business_number text,
  established_year text,
  email text,
  customer_center text,
  business_hours text,
  address_detail text,
  footer_description text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 9. landing_page_seo_settings (1:1 with landing_pages)
--    Created now for schema stability; the resolver/JSON-LD/sitemap logic
--    that reads this table is built in a later stage.
-- -----------------------------------------------------------------------------
create table if not exists landing_page_seo_settings (
  landing_page_id uuid primary key references landing_pages(id) on delete cascade,

  seo_title text,
  seo_description text,
  keywords text[],
  og_title text,
  og_description text,
  og_image_url text,
  seo_noindex boolean not null default false,
  business_category text,
  service_area text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- updated_at trigger — one shared function, reused by every table above.
-- =============================================================================
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_landing_pages_updated_at
  before update on landing_pages
  for each row execute function set_updated_at();

create trigger trg_landing_products_updated_at
  before update on landing_products
  for each row execute function set_updated_at();

create trigger trg_landing_features_updated_at
  before update on landing_features
  for each row execute function set_updated_at();

create trigger trg_landing_metrics_updated_at
  before update on landing_metrics
  for each row execute function set_updated_at();

create trigger trg_landing_specifications_updated_at
  before update on landing_specifications
  for each row execute function set_updated_at();

create trigger trg_landing_faqs_updated_at
  before update on landing_faqs
  for each row execute function set_updated_at();

create trigger trg_landing_process_steps_updated_at
  before update on landing_process_steps
  for each row execute function set_updated_at();

create trigger trg_landing_company_info_updated_at
  before update on landing_company_info
  for each row execute function set_updated_at();

create trigger trg_landing_page_seo_settings_updated_at
  before update on landing_page_seo_settings
  for each row execute function set_updated_at();

-- =============================================================================
-- Indexes
-- Note: landing_pages.slug already has an implicit unique index from the
-- `unique` constraint above, so no separate index is created for it here.
-- =============================================================================
create index if not exists idx_landing_pages_status on landing_pages(status);

create index if not exists idx_landing_products_landing_page_id on landing_products(landing_page_id);
create index if not exists idx_landing_features_landing_page_id on landing_features(landing_page_id);
create index if not exists idx_landing_metrics_landing_page_id on landing_metrics(landing_page_id);
create index if not exists idx_landing_specifications_landing_page_id on landing_specifications(landing_page_id);
create index if not exists idx_landing_specifications_product_id on landing_specifications(product_id);
create index if not exists idx_landing_faqs_landing_page_id on landing_faqs(landing_page_id);
create index if not exists idx_landing_process_steps_landing_page_id on landing_process_steps(landing_page_id);

-- =============================================================================
-- Row Level Security
--
-- Stage 2 has no Auth and no application write path yet, so:
--   - RLS is enabled on every table.
--   - Only SELECT policies are created (no INSERT/UPDATE/DELETE policies at
--     all — an "allow everything before Auth exists" write policy is
--     exactly the risky shortcut we're avoiding here).
--   - landing_pages itself is scoped to `status = 'public'` — that check is
--     simple and cheap to do now.
--   - Child tables (products/features/.../seo settings) are left as open
--     SELECT for anon/authenticated in this stage. Scoping them to their
--     parent's status too would need an EXISTS subquery against
--     landing_pages per row; the task description explicitly allows
--     deferring that extra complexity to the Stage 5 public-page policy
--     work. Practical exposure is low in the meantime: child rows only
--     carry a landing_page_id UUID, which isn't enumerable, and nothing in
--     the app joins these tables without first resolving a page by slug.
-- =============================================================================
alter table landing_pages enable row level security;
alter table landing_products enable row level security;
alter table landing_features enable row level security;
alter table landing_metrics enable row level security;
alter table landing_specifications enable row level security;
alter table landing_faqs enable row level security;
alter table landing_process_steps enable row level security;
alter table landing_company_info enable row level security;
alter table landing_page_seo_settings enable row level security;

create policy "Public landing pages are readable"
  on landing_pages for select
  to anon, authenticated
  using (status = 'public');

create policy "Landing page products are readable"
  on landing_products for select
  to anon, authenticated
  using (true);

create policy "Landing page features are readable"
  on landing_features for select
  to anon, authenticated
  using (true);

create policy "Landing page metrics are readable"
  on landing_metrics for select
  to anon, authenticated
  using (true);

create policy "Landing page specifications are readable"
  on landing_specifications for select
  to anon, authenticated
  using (true);

create policy "Landing page faqs are readable"
  on landing_faqs for select
  to anon, authenticated
  using (true);

create policy "Landing page process steps are readable"
  on landing_process_steps for select
  to anon, authenticated
  using (true);

create policy "Landing page company info is readable"
  on landing_company_info for select
  to anon, authenticated
  using (true);

create policy "Landing page SEO settings are readable"
  on landing_page_seo_settings for select
  to anon, authenticated
  using (true);
