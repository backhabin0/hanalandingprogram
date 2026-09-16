import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { supabaseEnv } from "@/lib/supabase/env";
import { LANDING_ASSETS_BUCKET } from "./paths";

type AnySupabaseClient = SupabaseClient<Database>;

/**
 * Every DB column that can hold a `landing-page-assets` URL. Checked before
 * ever deleting a Storage object, since a future page-duplication feature
 * (or simply linking the same case image from two rows) could mean more
 * than one row points at the same URL.
 */
const REFERENCE_COLUMNS: { table: keyof Database["public"]["Tables"]; column: string }[] = [
  { table: "landing_pages", column: "logo_url" },
  { table: "landing_pages", column: "main_image_url" },
  { table: "landing_products", column: "image_url" },
  { table: "landing_page_seo_settings", column: "og_image_url" },
  { table: "landing_cases", column: "image_url" },
  { table: "landing_product_images", column: "image_url" },
  { table: "landing_gallery_images", column: "image_url" },
];

/**
 * True only for a URL that is actually a `landing-page-assets` object in
 * THIS Supabase project — never attempts to delete an arbitrary external
 * URL an admin might have pasted into a plain URL field (SEO OG image,
 * pre-Stage-9 case image URLs, ...).
 */
export function parseLandingAssetPath(url: string | null | undefined): string | null {
  if (!url) return null;
  const prefix = `${supabaseEnv.url}/storage/v1/object/public/${LANDING_ASSETS_BUCKET}/`;
  if (!url.startsWith(prefix)) return null;
  const path = url.slice(prefix.length);
  return path.length > 0 ? path : null;
}

/** Whether `url` is still referenced by any row in any of the tables above. */
async function isReferenced(supabase: AnySupabaseClient, url: string): Promise<boolean> {
  for (const { table, column } of REFERENCE_COLUMNS) {
    // REFERENCE_COLUMNS spans tables with different Row shapes and a
    // dynamic column name, which supabase-js's per-table generics can't
    // express in a loop — narrowed to `any` at the query-builder boundary
    // only; the query itself (count of rows where `column = url`) is simple
    // enough that this doesn't hide a real type error.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query = supabase.from(table) as any;
    const { count, error } = await query.select("*", { count: "exact", head: true }).eq(column, url);
    if (error) {
      // Fails closed: if we can't confirm it's unreferenced, don't delete it.
      console.error(`[asset-refs] reference check failed on ${String(table)}.${column}:`, error.message);
      return true;
    }
    if ((count ?? 0) > 0) return true;
  }
  return false;
}

/**
 * Deletes a Storage object only if (a) it's actually one of ours and (b) no
 * row anywhere still references its URL. Safe to call with `null`/external
 * URLs — both are silently no-ops. Never throws: a cleanup failure here
 * should not fail the caller's already-successful DB update.
 */
export async function removeAssetIfUnreferenced(supabase: AnySupabaseClient, url: string | null | undefined): Promise<void> {
  const path = parseLandingAssetPath(url);
  if (!path) return;

  try {
    if (await isReferenced(supabase, url as string)) return;
    const { error } = await supabase.storage.from(LANDING_ASSETS_BUCKET).remove([path]);
    if (error) console.error("[asset-refs] storage removal failed:", error.message);
  } catch (err) {
    console.error("[asset-refs] unexpected error during cleanup:", err);
  }
}

/** Best-effort delete of a just-uploaded object when a subsequent DB write fails. No reference check needed — nothing could reference a brand-new path yet. */
export async function removeUploadedObject(supabase: AnySupabaseClient, path: string): Promise<void> {
  try {
    const { error } = await supabase.storage.from(LANDING_ASSETS_BUCKET).remove([path]);
    if (error) console.error("[asset-refs] rollback removal failed:", error.message);
  } catch (err) {
    console.error("[asset-refs] unexpected error during rollback:", err);
  }
}
