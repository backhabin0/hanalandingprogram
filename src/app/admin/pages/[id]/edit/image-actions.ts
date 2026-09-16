"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapSupabaseError } from "@/lib/supabase-errors";
import { uploadImageObject } from "@/lib/storage/upload";
import { removeAssetIfUnreferenced, removeUploadedObject } from "@/lib/storage/asset-refs";
import {
  buildCaseImagePath,
  buildGalleryImagePath,
  buildHeroPath,
  buildLogoPath,
  buildOgPath,
  buildProductImagePath,
} from "@/lib/storage/paths";
import { mapGalleryImageRow, mapProductImageRow } from "@/lib/landing-pages";
import type { LandingGalleryImage, LandingProductImage } from "@/types/landing";

/**
 * Every image mutation for `/admin/pages/[id]/edit`: logo, hero, product
 * representative image, product gallery, case image, page gallery, OG image.
 *
 * These are called directly as plain async functions from client components
 * (`onClick={() => uploadXAction(...)}`), never through `<form action>`.
 * ProductsEditor/CasesEditor already wrap many rows in one big `<form>` per
 * Stage 7/8 — nesting another `<form>` inside one row for its image widget
 * would produce the exact invalid-HTML/hydration bug already documented in
 * `LandingPageForm`'s big comment about `MiniTemplatePreview`. Calling the
 * Server Action directly sidesteps that entirely: no `<form>`, no native
 * reset, no stale-checkbox-style bug class to defend against here.
 *
 * Upload/replace order is always: upload new object -> DB write succeeds ->
 * delete old object. Never the reverse — deleting the old image first and
 * then failing to upload the new one would leave the row pointing at
 * nothing. If the DB write fails after a successful upload, the freshly
 * uploaded (now-orphaned) object is rolled back instead.
 */

export interface SingleImageResult {
  error: string | null;
  url?: string | null;
}

export interface ProductGalleryResult {
  error: string | null;
  images?: LandingProductImage[];
}

export interface PageGalleryResult {
  error: string | null;
  images?: LandingGalleryImage[];
}

function getFile(formData: FormData): File | null {
  const value = formData.get("file");
  return value instanceof File ? value : null;
}

// ---------------------------------------------------------------------------
// Logo
// ---------------------------------------------------------------------------

export async function uploadLandingLogoAction(landingPageId: string, formData: FormData): Promise<SingleImageResult> {
  await requireUser();
  const supabase = await createSupabaseServerClient();

  const uploaded = await uploadImageObject(supabase, "logo", getFile(formData), (ext) =>
    buildLogoPath(landingPageId, ext)
  );
  if (!uploaded.ok) return { error: uploaded.error };

  const { data: existing } = await supabase
    .from("landing_pages")
    .select("logo_url")
    .eq("id", landingPageId)
    .maybeSingle();

  const { error } = await supabase.from("landing_pages").update({ logo_url: uploaded.result.url }).eq("id", landingPageId);
  if (error) {
    await removeUploadedObject(supabase, uploaded.result.path);
    return { error: mapSupabaseError(error) };
  }

  await removeAssetIfUnreferenced(supabase, existing?.logo_url ?? null);
  revalidatePath(`/admin/pages/${landingPageId}/edit`);
  revalidatePath("/[slug]", "page");
  return { error: null, url: uploaded.result.url };
}

export async function removeLandingLogoAction(landingPageId: string): Promise<SingleImageResult> {
  await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase
    .from("landing_pages")
    .select("logo_url")
    .eq("id", landingPageId)
    .maybeSingle();

  const { error } = await supabase.from("landing_pages").update({ logo_url: null }).eq("id", landingPageId);
  if (error) return { error: mapSupabaseError(error) };

  await removeAssetIfUnreferenced(supabase, existing?.logo_url ?? null);
  revalidatePath(`/admin/pages/${landingPageId}/edit`);
  revalidatePath("/[slug]", "page");
  return { error: null, url: null };
}

// ---------------------------------------------------------------------------
// Hero / main image
// ---------------------------------------------------------------------------

export async function uploadLandingHeroAction(landingPageId: string, formData: FormData): Promise<SingleImageResult> {
  await requireUser();
  const supabase = await createSupabaseServerClient();

  const uploaded = await uploadImageObject(supabase, "hero", getFile(formData), (ext) =>
    buildHeroPath(landingPageId, ext)
  );
  if (!uploaded.ok) return { error: uploaded.error };

  const { data: existing } = await supabase
    .from("landing_pages")
    .select("main_image_url")
    .eq("id", landingPageId)
    .maybeSingle();

  const { error } = await supabase
    .from("landing_pages")
    .update({ main_image_url: uploaded.result.url })
    .eq("id", landingPageId);
  if (error) {
    await removeUploadedObject(supabase, uploaded.result.path);
    return { error: mapSupabaseError(error) };
  }

  await removeAssetIfUnreferenced(supabase, existing?.main_image_url ?? null);
  revalidatePath(`/admin/pages/${landingPageId}/edit`);
  revalidatePath("/[slug]", "page");
  return { error: null, url: uploaded.result.url };
}

export async function removeLandingHeroAction(landingPageId: string): Promise<SingleImageResult> {
  await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase
    .from("landing_pages")
    .select("main_image_url")
    .eq("id", landingPageId)
    .maybeSingle();

  const { error } = await supabase.from("landing_pages").update({ main_image_url: null }).eq("id", landingPageId);
  if (error) return { error: mapSupabaseError(error) };

  await removeAssetIfUnreferenced(supabase, existing?.main_image_url ?? null);
  revalidatePath(`/admin/pages/${landingPageId}/edit`);
  revalidatePath("/[slug]", "page");
  return { error: null, url: null };
}

// ---------------------------------------------------------------------------
// Product representative image
// ---------------------------------------------------------------------------

export async function uploadProductImageAction(
  landingPageId: string,
  productId: string,
  formData: FormData
): Promise<SingleImageResult> {
  await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: product } = await supabase
    .from("landing_products")
    .select("id, image_url")
    .eq("id", productId)
    .eq("landing_page_id", landingPageId)
    .maybeSingle();
  if (!product) return { error: "제품을 찾을 수 없습니다." };

  const uploaded = await uploadImageObject(supabase, "product", getFile(formData), (ext) =>
    buildProductImagePath(landingPageId, productId, ext)
  );
  if (!uploaded.ok) return { error: uploaded.error };

  const { error } = await supabase
    .from("landing_products")
    .update({ image_url: uploaded.result.url })
    .eq("id", productId)
    .eq("landing_page_id", landingPageId);
  if (error) {
    await removeUploadedObject(supabase, uploaded.result.path);
    return { error: mapSupabaseError(error) };
  }

  await removeAssetIfUnreferenced(supabase, product.image_url);
  revalidatePath(`/admin/pages/${landingPageId}/edit`);
  revalidatePath("/[slug]", "page");
  return { error: null, url: uploaded.result.url };
}

export async function removeProductImageAction(landingPageId: string, productId: string): Promise<SingleImageResult> {
  await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: product } = await supabase
    .from("landing_products")
    .select("id, image_url")
    .eq("id", productId)
    .eq("landing_page_id", landingPageId)
    .maybeSingle();
  if (!product) return { error: "제품을 찾을 수 없습니다." };

  const { error } = await supabase
    .from("landing_products")
    .update({ image_url: null })
    .eq("id", productId)
    .eq("landing_page_id", landingPageId);
  if (error) return { error: mapSupabaseError(error) };

  await removeAssetIfUnreferenced(supabase, product.image_url);
  revalidatePath(`/admin/pages/${landingPageId}/edit`);
  revalidatePath("/[slug]", "page");
  return { error: null, url: null };
}

// ---------------------------------------------------------------------------
// Product gallery (landing_product_images)
// ---------------------------------------------------------------------------

async function fetchProductGallery(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  landingPageId: string,
  productId: string
) {
  const { data, error } = await supabase
    .from("landing_product_images")
    .select("*")
    .eq("landing_page_id", landingPageId)
    .eq("product_id", productId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapProductImageRow);
}

export async function addProductGalleryImageAction(
  landingPageId: string,
  productId: string,
  formData: FormData
): Promise<ProductGalleryResult> {
  await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: product } = await supabase
    .from("landing_products")
    .select("id")
    .eq("id", productId)
    .eq("landing_page_id", landingPageId)
    .maybeSingle();
  if (!product) return { error: "제품을 찾을 수 없습니다." };

  const uploaded = await uploadImageObject(supabase, "gallery", getFile(formData), (ext) =>
    buildProductImagePath(landingPageId, productId, ext)
  );
  if (!uploaded.ok) return { error: uploaded.error };

  const { count } = await supabase
    .from("landing_product_images")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId);

  const { error } = await supabase.from("landing_product_images").insert({
    landing_page_id: landingPageId,
    product_id: productId,
    image_url: uploaded.result.url,
    sort_order: count ?? 0,
  });
  if (error) {
    await removeUploadedObject(supabase, uploaded.result.path);
    return { error: mapSupabaseError(error) };
  }

  revalidatePath(`/admin/pages/${landingPageId}/edit`);
  revalidatePath("/[slug]", "page");
  return { error: null, images: await fetchProductGallery(supabase, landingPageId, productId) };
}

const GALLERY_META_MAX = { altText: 200, caption: 300 } as const;

export async function saveProductGalleryImagesAction(
  landingPageId: string,
  productId: string,
  images: { id: string; altText: string; caption: string; isActive: boolean; sortOrder: number }[]
): Promise<ProductGalleryResult> {
  await requireUser();
  const supabase = await createSupabaseServerClient();

  for (const image of images) {
    if (image.altText.length > GALLERY_META_MAX.altText) return { error: "대체 텍스트가 너무 깁니다." };
    if (image.caption.length > GALLERY_META_MAX.caption) return { error: "캡션이 너무 깁니다." };
  }

  for (const image of images) {
    const { error } = await supabase
      .from("landing_product_images")
      .update({
        alt_text: image.altText || null,
        caption: image.caption || null,
        is_active: image.isActive,
        sort_order: image.sortOrder,
      })
      .eq("id", image.id)
      .eq("product_id", productId)
      .eq("landing_page_id", landingPageId);
    if (error) return { error: mapSupabaseError(error) };
  }

  revalidatePath(`/admin/pages/${landingPageId}/edit`);
  revalidatePath("/[slug]", "page");
  return { error: null, images: await fetchProductGallery(supabase, landingPageId, productId) };
}

export async function deleteProductGalleryImageAction(
  landingPageId: string,
  productId: string,
  imageId: string
): Promise<ProductGalleryResult> {
  await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase
    .from("landing_product_images")
    .select("image_url")
    .eq("id", imageId)
    .eq("product_id", productId)
    .eq("landing_page_id", landingPageId)
    .maybeSingle();
  if (!existing) return { error: "이미지를 찾을 수 없습니다." };

  const { error } = await supabase
    .from("landing_product_images")
    .delete()
    .eq("id", imageId)
    .eq("product_id", productId)
    .eq("landing_page_id", landingPageId);
  if (error) return { error: mapSupabaseError(error) };

  await removeAssetIfUnreferenced(supabase, existing.image_url);
  revalidatePath(`/admin/pages/${landingPageId}/edit`);
  revalidatePath("/[slug]", "page");
  return { error: null, images: await fetchProductGallery(supabase, landingPageId, productId) };
}

// ---------------------------------------------------------------------------
// Case image
// ---------------------------------------------------------------------------

export async function uploadCaseImageAction(
  landingPageId: string,
  caseId: string,
  formData: FormData
): Promise<SingleImageResult> {
  await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: caseRow } = await supabase
    .from("landing_cases")
    .select("id, image_url")
    .eq("id", caseId)
    .eq("landing_page_id", landingPageId)
    .maybeSingle();
  if (!caseRow) return { error: "사례를 찾을 수 없습니다." };

  const uploaded = await uploadImageObject(supabase, "case", getFile(formData), (ext) =>
    buildCaseImagePath(landingPageId, caseId, ext)
  );
  if (!uploaded.ok) return { error: uploaded.error };

  const { error } = await supabase
    .from("landing_cases")
    .update({ image_url: uploaded.result.url })
    .eq("id", caseId)
    .eq("landing_page_id", landingPageId);
  if (error) {
    await removeUploadedObject(supabase, uploaded.result.path);
    return { error: mapSupabaseError(error) };
  }

  await removeAssetIfUnreferenced(supabase, caseRow.image_url);
  revalidatePath(`/admin/pages/${landingPageId}/edit`);
  revalidatePath("/[slug]", "page");
  return { error: null, url: uploaded.result.url };
}

export async function removeCaseImageAction(landingPageId: string, caseId: string): Promise<SingleImageResult> {
  await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: caseRow } = await supabase
    .from("landing_cases")
    .select("id, image_url")
    .eq("id", caseId)
    .eq("landing_page_id", landingPageId)
    .maybeSingle();
  if (!caseRow) return { error: "사례를 찾을 수 없습니다." };

  const { error } = await supabase
    .from("landing_cases")
    .update({ image_url: null })
    .eq("id", caseId)
    .eq("landing_page_id", landingPageId);
  if (error) return { error: mapSupabaseError(error) };

  await removeAssetIfUnreferenced(supabase, caseRow.image_url);
  revalidatePath(`/admin/pages/${landingPageId}/edit`);
  revalidatePath("/[slug]", "page");
  return { error: null, url: null };
}

// ---------------------------------------------------------------------------
// Page gallery (landing_gallery_images)
// ---------------------------------------------------------------------------

async function fetchPageGallery(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  landingPageId: string
) {
  const { data, error } = await supabase
    .from("landing_gallery_images")
    .select("*")
    .eq("landing_page_id", landingPageId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapGalleryImageRow);
}

export async function addPageGalleryImageAction(landingPageId: string, formData: FormData): Promise<PageGalleryResult> {
  await requireUser();
  const supabase = await createSupabaseServerClient();

  const uploaded = await uploadImageObject(supabase, "gallery", getFile(formData), (ext) =>
    buildGalleryImagePath(landingPageId, ext)
  );
  if (!uploaded.ok) return { error: uploaded.error };

  const { count } = await supabase
    .from("landing_gallery_images")
    .select("*", { count: "exact", head: true })
    .eq("landing_page_id", landingPageId);

  const { error } = await supabase.from("landing_gallery_images").insert({
    landing_page_id: landingPageId,
    image_url: uploaded.result.url,
    sort_order: count ?? 0,
  });
  if (error) {
    await removeUploadedObject(supabase, uploaded.result.path);
    return { error: mapSupabaseError(error) };
  }

  revalidatePath(`/admin/pages/${landingPageId}/edit`);
  revalidatePath("/[slug]", "page");
  return { error: null, images: await fetchPageGallery(supabase, landingPageId) };
}

export async function savePageGalleryImagesAction(
  landingPageId: string,
  images: { id: string; altText: string; caption: string; isActive: boolean; sortOrder: number }[]
): Promise<PageGalleryResult> {
  await requireUser();
  const supabase = await createSupabaseServerClient();

  for (const image of images) {
    if (image.altText.length > GALLERY_META_MAX.altText) return { error: "대체 텍스트가 너무 깁니다." };
    if (image.caption.length > GALLERY_META_MAX.caption) return { error: "캡션이 너무 깁니다." };
  }

  for (const image of images) {
    const { error } = await supabase
      .from("landing_gallery_images")
      .update({
        alt_text: image.altText || null,
        caption: image.caption || null,
        is_active: image.isActive,
        sort_order: image.sortOrder,
      })
      .eq("id", image.id)
      .eq("landing_page_id", landingPageId);
    if (error) return { error: mapSupabaseError(error) };
  }

  revalidatePath(`/admin/pages/${landingPageId}/edit`);
  revalidatePath("/[slug]", "page");
  return { error: null, images: await fetchPageGallery(supabase, landingPageId) };
}

export async function deletePageGalleryImageAction(
  landingPageId: string,
  imageId: string
): Promise<PageGalleryResult> {
  await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase
    .from("landing_gallery_images")
    .select("image_url")
    .eq("id", imageId)
    .eq("landing_page_id", landingPageId)
    .maybeSingle();
  if (!existing) return { error: "이미지를 찾을 수 없습니다." };

  const { error } = await supabase
    .from("landing_gallery_images")
    .delete()
    .eq("id", imageId)
    .eq("landing_page_id", landingPageId);
  if (error) return { error: mapSupabaseError(error) };

  await removeAssetIfUnreferenced(supabase, existing.image_url);
  revalidatePath(`/admin/pages/${landingPageId}/edit`);
  revalidatePath("/[slug]", "page");
  return { error: null, images: await fetchPageGallery(supabase, landingPageId) };
}

// ---------------------------------------------------------------------------
// OG image (landing_page_seo_settings — 1:1, may not have a row yet)
// ---------------------------------------------------------------------------

export async function uploadOgImageAction(landingPageId: string, formData: FormData): Promise<SingleImageResult> {
  await requireUser();
  const supabase = await createSupabaseServerClient();

  const uploaded = await uploadImageObject(supabase, "og", getFile(formData), (ext) => buildOgPath(landingPageId, ext));
  if (!uploaded.ok) return { error: uploaded.error };

  const { data: existing } = await supabase
    .from("landing_page_seo_settings")
    .select("og_image_url")
    .eq("landing_page_id", landingPageId)
    .maybeSingle();

  const { error } = await supabase
    .from("landing_page_seo_settings")
    .upsert({ landing_page_id: landingPageId, og_image_url: uploaded.result.url }, { onConflict: "landing_page_id" });
  if (error) {
    await removeUploadedObject(supabase, uploaded.result.path);
    return { error: mapSupabaseError(error) };
  }

  await removeAssetIfUnreferenced(supabase, existing?.og_image_url ?? null);
  revalidatePath(`/admin/pages/${landingPageId}/edit`);
  revalidatePath("/[slug]", "page");
  return { error: null, url: uploaded.result.url };
}

export async function removeOgImageAction(landingPageId: string): Promise<SingleImageResult> {
  await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase
    .from("landing_page_seo_settings")
    .select("og_image_url")
    .eq("landing_page_id", landingPageId)
    .maybeSingle();

  const { error } = await supabase
    .from("landing_page_seo_settings")
    .upsert({ landing_page_id: landingPageId, og_image_url: null }, { onConflict: "landing_page_id" });
  if (error) return { error: mapSupabaseError(error) };

  await removeAssetIfUnreferenced(supabase, existing?.og_image_url ?? null);
  revalidatePath(`/admin/pages/${landingPageId}/edit`);
  revalidatePath("/[slug]", "page");
  return { error: null, url: null };
}
