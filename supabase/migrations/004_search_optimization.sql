-- =============================================================================
-- 004_search_optimization.sql
--
-- Stage 8: SEO / AEO / GEO structured-data support.
--
-- Three independent changes, all additive (001-003 are never modified):
--
--   1. landing_page_seo_settings gains optional columns for the admin's
--      content-quality guide rails (primary/secondary keywords, search
--      intent, a locality description sentence). None of these are ever
--      rendered as a meta keywords tag — see src/lib/seo/resolve.ts.
--
--   2. landing_products gains item_type ('product' | 'service', default
--      'product') so JSON-LD can emit schema.org Product vs Service instead
--      of guessing. Existing rows default to 'product', matching 001's
--      original comment that this table held both without a split.
--
--   3. landing_cases is new: install/service case studies, optionally
--      linked to one product. Used for local-SEO content depth (see the
--      Stage 8 report) — public-visible only when both the case and its
--      parent page are active/public, exactly like every other child table.
--
-- Run this in: Supabase Dashboard → SQL Editor → paste → Run.
-- (Run 001, 002, 003 first if you haven't already.)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. landing_page_seo_settings — additional optional fields
-- -----------------------------------------------------------------------------
alter table landing_page_seo_settings
  add column if not exists primary_keyword text,
  add column if not exists secondary_keywords text[],
  add column if not exists search_intent text,
  add column if not exists locality_description text;

comment on column landing_page_seo_settings.primary_keyword is
  'Admin-facing content guide only — never rendered as a meta keywords tag.';
comment on column landing_page_seo_settings.secondary_keywords is
  'Admin-facing content guide only — never rendered as a meta keywords tag.';
comment on column landing_page_seo_settings.search_intent is
  'Free-text note (e.g. "local_service") for the admin''s own reference; not validated against an enum.';
comment on column landing_page_seo_settings.locality_description is
  'Real sentence describing the service area, shown in on-page HTML (not just metadata) when present.';

-- -----------------------------------------------------------------------------
-- 2. landing_products — product vs service distinction
-- -----------------------------------------------------------------------------
alter table landing_products
  add column if not exists item_type text not null default 'product'
    check (item_type in ('product', 'service'));

-- -----------------------------------------------------------------------------
-- 3. landing_cases — install/service case studies
-- -----------------------------------------------------------------------------
create table if not exists landing_cases (
  id uuid primary key default gen_random_uuid(),
  landing_page_id uuid not null references landing_pages(id) on delete cascade,
  product_id uuid references landing_products(id) on delete set null,

  title text not null,
  description text,
  region text,
  industry text,
  case_date date,
  image_url text,

  sort_order integer not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_landing_cases_updated_at
  before update on landing_cases
  for each row execute function set_updated_at();

create index if not exists idx_landing_cases_landing_page_id on landing_cases(landing_page_id);
create index if not exists idx_landing_cases_product_id on landing_cases(product_id);

alter table landing_cases enable row level security;

-- Same shape as every sibling child table's policy in 002: public can read
-- rows belonging to a public page; is_active is filtered in the app layer
-- (src/lib/public-landing-pages.ts), not in RLS, for consistency with how
-- every other child table already works.
create policy "Public can read cases of public pages"
  on landing_cases for select
  to anon
  using (
    exists (
      select 1 from landing_pages
      where landing_pages.id = landing_cases.landing_page_id
        and landing_pages.status = 'public'
    )
  );

create policy "Authenticated users can manage cases"
  on landing_cases for all
  to authenticated
  using (true)
  with check (true);

grant select, insert, update, delete on landing_cases to authenticated;

-- Every sibling child table's anon SELECT grant predates this migration
-- (in place since 001/003's original tables). landing_cases is the first
-- NEW table added after that baseline, and empirically does NOT inherit an
-- implicit anon grant in this project — confirmed by testing the public
-- route against a real Supabase project after running this migration: RLS
-- policy alone was not sufficient, anon got a bare "permission denied for
-- table landing_cases" (42501) until this explicit grant was added. Without
-- it, `getPublicCases` (src/lib/public-landing-pages.ts) throws on every
-- public page load, not just pages with cases.
grant select on landing_cases to anon;
