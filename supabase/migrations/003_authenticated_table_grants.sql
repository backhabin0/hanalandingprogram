-- =============================================================================
-- 003_authenticated_table_grants.sql
--
-- Stage 4: explicit, idempotent GRANTs for the authenticated role.
--
-- Supabase project bootstrap normally already grants ALL on public-schema
-- tables to anon/authenticated/service_role by default — that default is
-- *why* RLS is the thing every Supabase guide tells you to turn on
-- immediately; without it those default grants alone would let anyone
-- read/write everything. Neither 001 nor 002 restated or altered that.
--
-- There's no tool available here to query
-- information_schema.role_table_grants against the live project to confirm
-- the defaults are still intact, and GRANT is idempotent (re-granting an
-- already-held privilege is a no-op) — so this migration is a safe,
-- explicit statement of intent rather than a guess. If Stage 4's CRUD
-- Server Actions ever fail with Postgres error 42501
-- (insufficient_privilege) even though 002's RLS policies clearly allow the
-- operation, missing table-level GRANTs are the next thing to check, and
-- running this file resolves it either way.
--
-- Run this in: Supabase Dashboard → SQL Editor → paste → Run.
-- (Run 001 and 002 first if you haven't already.)
-- =============================================================================

grant usage on schema public to authenticated;

grant select, insert, update, delete on
  landing_pages,
  landing_products,
  landing_features,
  landing_metrics,
  landing_specifications,
  landing_faqs,
  landing_process_steps,
  landing_company_info,
  landing_page_seo_settings
to authenticated;
