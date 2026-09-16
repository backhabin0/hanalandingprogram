-- =============================================================================
-- 005_landing_page_images.sql
--
-- Stage 9: Supabase Storage + product/page gallery tables.
--
-- Three independent additions, all additive (001-004 are never modified):
--
--   1. A single public Storage bucket (`landing-page-assets`) for every
--      admin-uploaded image (logo, hero, product, case, gallery, OG).
--      Public read (these are public landing-page assets), but only
--      `authenticated` may upload/replace/delete objects in it.
--
--   2. landing_product_images — multiple extra photos per product, beyond
--      the single `landing_products.image_url` representative image.
--
--   3. landing_gallery_images — a whole-page photo gallery (site/office/
--      install photos), independent of any one product.
--
-- Run this in: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- (Run 001-004 first if you haven't already.)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Storage bucket + policies
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('landing-page-assets', 'landing-page-assets', true)
on conflict (id) do nothing;

-- RLS on storage.objects is already enabled project-wide by Supabase itself;
-- these policies are scoped to this one bucket only via `bucket_id`, so they
-- can't affect any other bucket that might exist.
drop policy if exists "Public can read landing-page-assets" on storage.objects;
create policy "Public can read landing-page-assets"
  on storage.objects for select
  to public
  using (bucket_id = 'landing-page-assets');

drop policy if exists "Authenticated can upload landing-page-assets" on storage.objects;
create policy "Authenticated can upload landing-page-assets"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'landing-page-assets');

drop policy if exists "Authenticated can update landing-page-assets" on storage.objects;
create policy "Authenticated can update landing-page-assets"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'landing-page-assets')
  with check (bucket_id = 'landing-page-assets');

drop policy if exists "Authenticated can delete landing-page-assets" on storage.objects;
create policy "Authenticated can delete landing-page-assets"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'landing-page-assets');

-- Stage 8 shipped with `landing_cases` missing its anon SELECT grant — the
-- RLS policy existed but the underlying table GRANT didn't, so every public
-- page 500'd for real anonymous visitors until it was patched. storage.objects
-- grants are normally pre-installed by the Storage extension, but given that
-- exact failure mode already happened once in this project, these are stated
-- explicitly and idempotently rather than assumed.
grant select on storage.objects to anon, authenticated;
grant insert, update, delete on storage.objects to authenticated;

-- -----------------------------------------------------------------------------
-- 2. landing_product_images — extra photos per product (beyond the single
--    representative landing_products.image_url)
-- -----------------------------------------------------------------------------
create table if not exists landing_product_images (
  id uuid primary key default gen_random_uuid(),
  landing_page_id uuid not null references landing_pages(id) on delete cascade,
  product_id uuid not null references landing_products(id) on delete cascade,

  image_url text not null,
  alt_text text,
  caption text,

  sort_order integer not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_landing_product_images_updated_at
  before update on landing_product_images
  for each row execute function set_updated_at();

create index if not exists idx_landing_product_images_landing_page_id on landing_product_images(landing_page_id);
create index if not exists idx_landing_product_images_product_id on landing_product_images(product_id);

alter table landing_product_images enable row level security;

-- Per the Stage 9 spec: unlike the sibling child tables (which only check the
-- parent page's status in RLS and filter is_active in the app layer), the
-- gallery tables check BOTH conditions directly in RLS.
create policy "Public can read active product images of public pages"
  on landing_product_images for select
  to anon
  using (
    is_active = true
    and exists (
      select 1 from landing_pages
      where landing_pages.id = landing_product_images.landing_page_id
        and landing_pages.status = 'public'
    )
  );

create policy "Authenticated users can manage product images"
  on landing_product_images for all
  to authenticated
  using (true)
  with check (true);

grant select on landing_product_images to anon;
grant select, insert, update, delete on landing_product_images to authenticated;

-- -----------------------------------------------------------------------------
-- 3. landing_gallery_images — whole-page photo gallery
-- -----------------------------------------------------------------------------
create table if not exists landing_gallery_images (
  id uuid primary key default gen_random_uuid(),
  landing_page_id uuid not null references landing_pages(id) on delete cascade,

  image_url text not null,
  alt_text text,
  caption text,

  sort_order integer not null default 0,
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_landing_gallery_images_updated_at
  before update on landing_gallery_images
  for each row execute function set_updated_at();

create index if not exists idx_landing_gallery_images_landing_page_id on landing_gallery_images(landing_page_id);

alter table landing_gallery_images enable row level security;

create policy "Public can read active gallery images of public pages"
  on landing_gallery_images for select
  to anon
  using (
    is_active = true
    and exists (
      select 1 from landing_pages
      where landing_pages.id = landing_gallery_images.landing_page_id
        and landing_pages.status = 'public'
    )
  );

create policy "Authenticated users can manage gallery images"
  on landing_gallery_images for all
  to authenticated
  using (true)
  with check (true);

grant select on landing_gallery_images to anon;
grant select, insert, update, delete on landing_gallery_images to authenticated;
