-- =============================================================================
-- 006_create_consultation_requests.sql
--
-- Stage 10: public consultation / quote request submissions.
--
-- One new table (`consultation_requests`), written to directly by anonymous
-- visitors on a public `/[slug]` page (general consultation, product
-- inquiry, service inquiry, quote request). Stage 11 adds the admin list/
-- status-update UI and email notifications — this migration only creates the
-- table and its access rules; it does not touch 001-005.
--
-- Run this in: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- (Run 001-005 first if you haven't already.)
-- =============================================================================

create table if not exists consultation_requests (
  id uuid primary key default gen_random_uuid(),

  -- Both child FKs use ON DELETE SET NULL, not CASCADE: a consultation is an
  -- operational record of a real customer contact and must survive the
  -- landing page (or one product on it) later being deleted or renamed.
  landing_page_id uuid references landing_pages(id) on delete set null,
  product_id uuid references landing_products(id) on delete set null,

  inquiry_type text not null default 'consultation'
    check (inquiry_type in ('consultation', 'quote', 'product', 'service', 'other')),

  name text not null,
  phone text not null,
  email text,
  company_name text,
  message text,
  preferred_contact text
    check (preferred_contact is null or preferred_contact in ('phone', 'kakao', 'email')),

  privacy_consent boolean not null,

  -- Stage 11 (admin status updates) consumes this; 'new' is the only status
  -- an anon INSERT is allowed to write (enforced in the RLS policy below).
  status text not null default 'new'
    check (status in ('new', 'contacted', 'completed', 'cancelled')),

  -- Client-generated crypto.randomUUID(), sent with every submit attempt so
  -- a retried/duplicated request (flaky network, double click) can't create
  -- a second row — see the unique index below.
  submission_id text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_consultation_requests_updated_at
  before update on consultation_requests
  for each row execute function set_updated_at();

create index if not exists idx_consultation_requests_landing_page_id on consultation_requests(landing_page_id);
create index if not exists idx_consultation_requests_product_id on consultation_requests(product_id);
create index if not exists idx_consultation_requests_status on consultation_requests(status);
create index if not exists idx_consultation_requests_created_at on consultation_requests(created_at);

-- A given submission_id must be unique, but most rows will never carry one
-- (older data, or a future manual admin-entered consultation) — a plain
-- unique constraint would collide every NULL against every other NULL under
-- some read paths, so this is a partial index instead.
create unique index if not exists idx_consultation_requests_submission_id_unique
  on consultation_requests(submission_id)
  where submission_id is not null;

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table consultation_requests enable row level security;

-- anon may INSERT only, and only a row that is actually safe to accept:
--   - privacy_consent must be true (never store an unconsented submission)
--   - status must be 'new' (anon can't insert a pre-resolved request)
--   - landing_page_id must point at a page that is currently public (blocks
--     a private/deleted page id reaching the DB even if a caller bypasses
--     the Server Action's own slug re-check)
--   - if product_id is set, it must belong to that same landing_page_id AND
--     be active (blocks cross-page product ids and inactive products)
-- This mirrors the Server Action's own validation — belt and suspenders,
-- since the action re-checks the same two conditions before ever reaching
-- this INSERT.
create policy "Anyone can submit a consultation request for a public page"
  on consultation_requests for insert
  to anon
  with check (
    privacy_consent = true
    and status = 'new'
    and landing_page_id is not null
    and exists (
      select 1 from landing_pages
      where landing_pages.id = consultation_requests.landing_page_id
        and landing_pages.status = 'public'
    )
    and (
      product_id is null
      or exists (
        select 1 from landing_products
        where landing_products.id = consultation_requests.product_id
          and landing_products.landing_page_id = consultation_requests.landing_page_id
          and landing_products.is_active = true
      )
    )
  );

-- No anon SELECT/UPDATE/DELETE policy exists — anon cannot read back,
-- modify, or remove any consultation request, including its own.

-- authenticated (Stage 11's admin) gets SELECT/INSERT/UPDATE, each its own
-- policy rather than `for all`, so DELETE stays denied even for the admin
-- role — consultation records are operational history and shouldn't be
-- trivially removable. Revisit this only with a deliberate retention/
-- deletion decision, not as a side effect of a future refactor.
create policy "Authenticated users can view consultation requests"
  on consultation_requests for select
  to authenticated
  using (true);

create policy "Authenticated users can insert consultation requests"
  on consultation_requests for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update consultation requests"
  on consultation_requests for update
  to authenticated
  using (true)
  with check (true);

-- -----------------------------------------------------------------------------
-- PostgreSQL GRANT
--
-- This project already got burned once (Stage 8, landing_cases) by RLS
-- policies existing on a brand-new table without the matching table-level
-- GRANT — anon got a bare 42501 "permission denied" regardless of what RLS
-- allowed. consultation_requests is a brand-new table exactly like that one,
-- so its GRANTs are stated explicitly here rather than assumed.
-- -----------------------------------------------------------------------------
grant insert on consultation_requests to anon;
grant select, insert, update on consultation_requests to authenticated;
-- No anon SELECT grant, and no DELETE grant for either role.
