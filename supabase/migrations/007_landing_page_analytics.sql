-- =============================================================================
-- 007_landing_page_analytics.sql
--
-- Stage 12: conversion-focused analytics events for public landing pages.
--
-- One new table (`landing_page_events`), written to directly by anonymous
-- visitors via a validating Route Handler (`POST /api/analytics`, never
-- Supabase JS called straight from the browser). Deliberately minimal and
-- privacy-light: no name/phone/email/IP/User-Agent/fingerprint/cookie id is
-- ever stored here — just "this event type happened for this page (and
-- optionally this product) at this time". Actual consultation conversion is
-- NOT tracked as an event here; it's counted from `consultation_requests`
-- row data directly (see Stage 12 report for why).
--
-- Run this in: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- (Run 001-006 first if you haven't already.)
-- =============================================================================

create table if not exists landing_page_events (
  id uuid primary key default gen_random_uuid(),

  -- Same ON DELETE SET NULL reasoning as consultation_requests (006): an
  -- event is a historical analytics record and should survive the page or
  -- product it was recorded against later being deleted, rather than being
  -- cascade-deleted and silently skewing historical totals downward.
  landing_page_id uuid references landing_pages(id) on delete set null,
  product_id uuid references landing_products(id) on delete set null,

  event_type text not null
    check (event_type in ('page_view', 'phone_click', 'kakao_click', 'product_cta_click', 'quote_cta_click')),

  -- A product-specific CTA click without a product_id would be meaningless
  -- to report on ("clicked *which* product's CTA?") — enforced here, not
  -- just in application code.
  check (event_type <> 'product_cta_click' or product_id is not null),

  created_at timestamptz not null default now()

  -- No updated_at / no update trigger: events are write-once historical
  -- records, never edited after insert (see the RLS section below — no
  -- UPDATE policy exists for any role).
);

-- Query patterns this migration's indexes are chosen for (see the Stage 12
-- report for the full reasoning): the admin analytics screen always filters
-- by a created_at range (7/30/90 days) and optionally by one landing_page_id,
-- then aggregates everything else (event_type breakdown, daily trend,
-- product breakdown) in application code from that one bounded result set —
-- so no per-event_type or per-product index is pulled into the hot path.
-- landing_page_id/product_id/event_type are still each indexed individually
-- per the Stage 12 spec's stated minimum, even though the composite below
-- already covers the landing_page_id-filtered case more efficiently.
create index if not exists idx_landing_page_events_landing_page_id on landing_page_events(landing_page_id);
create index if not exists idx_landing_page_events_product_id on landing_page_events(product_id);
create index if not exists idx_landing_page_events_event_type on landing_page_events(event_type);
create index if not exists idx_landing_page_events_created_at on landing_page_events(created_at);
create index if not exists idx_landing_page_events_page_created on landing_page_events(landing_page_id, created_at);

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table landing_page_events enable row level security;

-- anon may INSERT only, and only an event that's actually safe to accept —
-- mirrors consultation_requests' (006) anon insert policy shape:
--   - landing_page_id must point at a page that is currently public
--   - if product_id is set, it must belong to that same landing_page_id AND
--     be active
-- The Route Handler (src/app/api/analytics/route.ts) re-checks the same two
-- conditions in application code before ever reaching this INSERT — this is
-- the second line of defense, not the only one.
create policy "Anyone can record an analytics event for a public page"
  on landing_page_events for insert
  to anon
  with check (
    landing_page_id is not null
    and exists (
      select 1 from landing_pages
      where landing_pages.id = landing_page_events.landing_page_id
        and landing_pages.status = 'public'
    )
    and (
      product_id is null
      or exists (
        select 1 from landing_products
        where landing_products.id = landing_page_events.product_id
          and landing_products.landing_page_id = landing_page_events.landing_page_id
          and landing_products.is_active = true
      )
    )
  );

-- No anon SELECT/UPDATE/DELETE policy exists — anon cannot read back,
-- modify, or remove any analytics event.

-- authenticated (Stage 12's /admin/analytics) gets SELECT only. Events are
-- immutable historical records, so — unlike consultation_requests, which
-- needs authenticated UPDATE for status changes — no UPDATE/DELETE policy is
-- created for any role, including authenticated.
create policy "Authenticated users can view analytics events"
  on landing_page_events for select
  to authenticated
  using (true);

-- -----------------------------------------------------------------------------
-- PostgreSQL GRANT
--
-- Same lesson as every migration since Stage 8 (landing_cases): RLS policies
-- alone are not sufficient on a brand-new table without the matching
-- table-level GRANT, or anon gets a bare 42501 regardless of what RLS
-- allows. Stated explicitly here rather than assumed.
-- -----------------------------------------------------------------------------
grant insert on landing_page_events to anon;
grant select on landing_page_events to authenticated;
-- No anon SELECT grant, and no UPDATE/DELETE grant for either role.
