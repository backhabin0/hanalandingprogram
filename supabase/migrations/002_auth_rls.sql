-- =============================================================================
-- 002_auth_rls.sql
--
-- Stage 3: tightens RLS now that Supabase Auth is wired up. Does not modify
-- 001 — this migration only drops/replaces policies 001 created.
--
-- What changes:
--   1. The 8 child-table "anon can read everything" policies from 001 are
--      replaced with policies scoped to their parent landing_pages.status.
--      Under 001, a private page's products/features/faqs/etc. were still
--      readable by anyone who had (or guessed) the landing_page_id UUID.
--      That's closed here.
--   2. Every table gets one `authenticated` policy granting full
--      SELECT/INSERT/UPDATE/DELETE. This project has no role/membership
--      table — "authenticated" *is* "admin" here (see Stage 3 report). No
--      CRUD code is added in this stage; these policies just mean Stage 4's
--      CRUD helpers have something to run against on day one.
--   3. anon keeps no write access anywhere — unchanged from 001, restated
--      explicitly below for clarity.
--
-- Run this in: Supabase Dashboard → SQL Editor → paste → Run.
-- (Run 001 first if you haven't already.)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Drop the policies 001 created for these 9 tables. Recreated below with the
-- naming convention `"<Who> can <verb> ..."` for clarity.
-- -----------------------------------------------------------------------------
drop policy if exists "Public landing pages are readable" on landing_pages;
drop policy if exists "Landing page products are readable" on landing_products;
drop policy if exists "Landing page features are readable" on landing_features;
drop policy if exists "Landing page metrics are readable" on landing_metrics;
drop policy if exists "Landing page specifications are readable" on landing_specifications;
drop policy if exists "Landing page faqs are readable" on landing_faqs;
drop policy if exists "Landing page process steps are readable" on landing_process_steps;
drop policy if exists "Landing page company info is readable" on landing_company_info;
drop policy if exists "Landing page SEO settings are readable" on landing_page_seo_settings;

-- =============================================================================
-- landing_pages
-- =============================================================================
create policy "Public can read public landing pages"
  on landing_pages for select
  to anon
  using (status = 'public');

create policy "Authenticated users can manage landing pages"
  on landing_pages for all
  to authenticated
  using (true)
  with check (true);

-- =============================================================================
-- landing_products
-- =============================================================================
create policy "Public can read products of public pages"
  on landing_products for select
  to anon
  using (
    exists (
      select 1 from landing_pages
      where landing_pages.id = landing_products.landing_page_id
        and landing_pages.status = 'public'
    )
  );

create policy "Authenticated users can manage products"
  on landing_products for all
  to authenticated
  using (true)
  with check (true);

-- =============================================================================
-- landing_features
-- =============================================================================
create policy "Public can read features of public pages"
  on landing_features for select
  to anon
  using (
    exists (
      select 1 from landing_pages
      where landing_pages.id = landing_features.landing_page_id
        and landing_pages.status = 'public'
    )
  );

create policy "Authenticated users can manage features"
  on landing_features for all
  to authenticated
  using (true)
  with check (true);

-- =============================================================================
-- landing_metrics
-- =============================================================================
create policy "Public can read metrics of public pages"
  on landing_metrics for select
  to anon
  using (
    exists (
      select 1 from landing_pages
      where landing_pages.id = landing_metrics.landing_page_id
        and landing_pages.status = 'public'
    )
  );

create policy "Authenticated users can manage metrics"
  on landing_metrics for all
  to authenticated
  using (true)
  with check (true);

-- =============================================================================
-- landing_specifications
--
-- Scoped via landing_page_id (always set) rather than product_id (nullable,
-- only set for product-specific specs) — checking product_id alone would
-- leave page-level specs (product_id is null) completely unscoped, and
-- checking it in addition to landing_page_id adds nothing: every spec row
-- already carries its own landing_page_id, so that alone fully determines
-- whether its parent page is public.
-- =============================================================================
create policy "Public can read specifications of public pages"
  on landing_specifications for select
  to anon
  using (
    exists (
      select 1 from landing_pages
      where landing_pages.id = landing_specifications.landing_page_id
        and landing_pages.status = 'public'
    )
  );

create policy "Authenticated users can manage specifications"
  on landing_specifications for all
  to authenticated
  using (true)
  with check (true);

-- =============================================================================
-- landing_faqs
-- =============================================================================
create policy "Public can read faqs of public pages"
  on landing_faqs for select
  to anon
  using (
    exists (
      select 1 from landing_pages
      where landing_pages.id = landing_faqs.landing_page_id
        and landing_pages.status = 'public'
    )
  );

create policy "Authenticated users can manage faqs"
  on landing_faqs for all
  to authenticated
  using (true)
  with check (true);

-- =============================================================================
-- landing_process_steps
-- =============================================================================
create policy "Public can read process steps of public pages"
  on landing_process_steps for select
  to anon
  using (
    exists (
      select 1 from landing_pages
      where landing_pages.id = landing_process_steps.landing_page_id
        and landing_pages.status = 'public'
    )
  );

create policy "Authenticated users can manage process steps"
  on landing_process_steps for all
  to authenticated
  using (true)
  with check (true);

-- =============================================================================
-- landing_company_info
-- =============================================================================
create policy "Public can read company info of public pages"
  on landing_company_info for select
  to anon
  using (
    exists (
      select 1 from landing_pages
      where landing_pages.id = landing_company_info.landing_page_id
        and landing_pages.status = 'public'
    )
  );

create policy "Authenticated users can manage company info"
  on landing_company_info for all
  to authenticated
  using (true)
  with check (true);

-- =============================================================================
-- landing_page_seo_settings
-- =============================================================================
create policy "Public can read SEO settings of public pages"
  on landing_page_seo_settings for select
  to anon
  using (
    exists (
      select 1 from landing_pages
      where landing_pages.id = landing_page_seo_settings.landing_page_id
        and landing_pages.status = 'public'
    )
  );

create policy "Authenticated users can manage SEO settings"
  on landing_page_seo_settings for all
  to authenticated
  using (true)
  with check (true);

-- =============================================================================
-- anon write access — explicitly none anywhere.
--
-- Nothing to create here: RLS defaults to deny, and the only anon policies
-- above (on every table) are `for select`. No `for insert/update/delete`
-- policy exists for anon on any of the 9 tables, so anon INSERT/UPDATE/
-- DELETE is rejected everywhere, same as under 001.
-- =============================================================================
