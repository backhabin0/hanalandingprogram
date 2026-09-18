"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateSlug } from "@/lib/slug";
import { isSafeHttpUrl } from "@/lib/validation";
import { mapSupabaseError } from "@/lib/supabase-errors";
import { getString, toNullable, parseIndexedGroups } from "@/lib/form-data";
import { removeAssetIfUnreferenced } from "@/lib/storage/asset-refs";
import type { Database } from "@/lib/supabase/database.types";
import type { LandingPageStatus, LandingTemplateId } from "@/types/landing";

export interface LandingPageFormState {
  error: string | null;
}

type LandingPageInsert = Database["public"]["Tables"]["landing_pages"]["Insert"];
type LandingProductInsert = Database["public"]["Tables"]["landing_products"]["Insert"];
type LandingFeatureInsert = Database["public"]["Tables"]["landing_features"]["Insert"];

const TEMPLATE_IDS: LandingTemplateId[] = ["template-a", "template-b", "template-c"];
const STATUSES: LandingPageStatus[] = ["public", "private"];

const MAX_LENGTH = {
  businessName: 100,
  title: 150,
  heroTitle: 200,
  heroDescription: 500,
  description: 5000,
  address: 300,
  region: 100,
  industry: 100,
  phone: 30,
  priceLabel: 100,
  price: 100,
  priceUnit: 50,
  priceDescription: 500,
  productName: 150,
  featureTitle: 150,
  icon: 20,
} as const;

// ---------------------------------------------------------------------------
// Field parsing + validation
// ---------------------------------------------------------------------------

type ParsedLandingPage = Omit<LandingPageInsert, "business_name" | "title" | "slug"> & {
  business_name: string;
  title: string;
  slug: string;
};

function parseLandingPageFields(formData: FormData): { data: ParsedLandingPage } | { error: string } {
  const businessName = getString(formData, "businessName");
  const title = getString(formData, "title");
  const rawSlug = getString(formData, "slug");
  const heroTitle = getString(formData, "heroTitle");
  const heroDescription = getString(formData, "heroDescription");
  const description = getString(formData, "description");
  const phone = getString(formData, "phone");
  const kakaoUrl = getString(formData, "kakaoUrl");
  const address = getString(formData, "address");
  const region = getString(formData, "region");
  const industry = getString(formData, "industry");
  const priceLabel = getString(formData, "priceLabel");
  const price = getString(formData, "price");
  const priceUnit = getString(formData, "priceUnit");
  const priceDescription = getString(formData, "priceDescription");
  const template = getString(formData, "template");
  const status = getString(formData, "status");

  if (!businessName) return { error: "업체명을 입력해주세요." };
  if (businessName.length > MAX_LENGTH.businessName) {
    return { error: `업체명은 ${MAX_LENGTH.businessName}자 이하로 입력해주세요.` };
  }
  if (!title) return { error: "페이지 제목을 입력해주세요." };
  if (title.length > MAX_LENGTH.title) return { error: `페이지 제목은 ${MAX_LENGTH.title}자 이하로 입력해주세요.` };

  const slugError = validateSlug(rawSlug);
  if (slugError) return { error: slugError };

  if (!heroTitle) return { error: "Hero 제목을 입력해주세요." };
  if (heroTitle.length > MAX_LENGTH.heroTitle) {
    return { error: `Hero 제목은 ${MAX_LENGTH.heroTitle}자 이하로 입력해주세요.` };
  }
  if (heroDescription.length > MAX_LENGTH.heroDescription) {
    return { error: `Hero 설명은 ${MAX_LENGTH.heroDescription}자 이하로 입력해주세요.` };
  }
  if (description.length > MAX_LENGTH.description) {
    return { error: `소개 문구는 ${MAX_LENGTH.description}자 이하로 입력해주세요.` };
  }
  if (address.length > MAX_LENGTH.address) return { error: `주소는 ${MAX_LENGTH.address}자 이하로 입력해주세요.` };
  if (region.length > MAX_LENGTH.region) return { error: `지역은 ${MAX_LENGTH.region}자 이하로 입력해주세요.` };
  if (industry.length > MAX_LENGTH.industry) return { error: `업종은 ${MAX_LENGTH.industry}자 이하로 입력해주세요.` };
  if (phone.length > MAX_LENGTH.phone) return { error: "전화번호가 너무 깁니다." };
  if (kakaoUrl && !isSafeHttpUrl(kakaoUrl)) {
    return { error: "카카오톡 채널 URL은 http:// 또는 https://로 시작하는 주소만 입력할 수 있습니다." };
  }
  if (priceLabel.length > MAX_LENGTH.priceLabel) return { error: "대표 가격 라벨이 너무 깁니다." };
  if (price.length > MAX_LENGTH.price) return { error: "대표 가격 값이 너무 깁니다." };
  if (priceUnit.length > MAX_LENGTH.priceUnit) return { error: "가격 단위가 너무 깁니다." };
  if (priceDescription.length > MAX_LENGTH.priceDescription) return { error: "가격 설명이 너무 깁니다." };

  if (!TEMPLATE_IDS.includes(template as LandingTemplateId)) {
    return { error: "템플릿을 선택해주세요." };
  }
  if (!STATUSES.includes(status as LandingPageStatus)) {
    return { error: "공개 상태를 선택해주세요." };
  }

  return {
    data: {
      business_name: businessName,
      title,
      slug: rawSlug.trim(),
      hero_title: heroTitle,
      hero_description: toNullable(heroDescription),
      description: toNullable(description),
      phone: toNullable(phone),
      kakao_url: toNullable(kakaoUrl),
      address: toNullable(address),
      region: toNullable(region),
      industry: toNullable(industry),
      price_label: toNullable(priceLabel),
      price: toNullable(price),
      price_unit: toNullable(priceUnit),
      price_description: toNullable(priceDescription),
      template: template as LandingTemplateId,
      status: status as LandingPageStatus,
    },
  };
}

/** Only rows with a name are kept — an empty draft row is just discarded. */
function parseProducts(formData: FormData): Omit<LandingProductInsert, "landing_page_id">[] {
  return parseIndexedGroups(formData, "products")
    .filter((row) => row.name)
    .map((row, index) => ({
      name: row.name.slice(0, MAX_LENGTH.productName),
      short_description: toNullable(row.shortDescription ?? ""),
      description: toNullable(row.description ?? ""),
      price: toNullable(row.price ?? ""),
      price_unit: toNullable(row.priceUnit ?? ""),
      price_description: toNullable(row.priceNote ?? ""),
      sort_order: index,
    }));
}

/** Only rows with a title are kept. */
function parseFeatures(formData: FormData): Omit<LandingFeatureInsert, "landing_page_id">[] {
  return parseIndexedGroups(formData, "features")
    .filter((row) => row.title)
    .map((row, index) => ({
      title: row.title.slice(0, MAX_LENGTH.featureTitle),
      description: toNullable(row.description ?? ""),
      icon: toNullable((row.icon ?? "").slice(0, MAX_LENGTH.icon)),
      sort_order: index,
    }));
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export async function createLandingPageAction(
  _prevState: LandingPageFormState,
  formData: FormData
): Promise<LandingPageFormState> {
  await requireUser();

  const parsed = parseLandingPageFields(formData);
  if ("error" in parsed) return { error: parsed.error };

  const products = parseProducts(formData);
  const features = parseFeatures(formData);

  const supabase = await createSupabaseServerClient();

  const { data: page, error: insertError } = await supabase
    .from("landing_pages")
    .insert(parsed.data)
    .select("id")
    .single();

  if (insertError || !page) {
    return { error: mapSupabaseError(insertError!) };
  }

  if (products.length > 0 || features.length > 0) {
    const [productsResult, featuresResult] = await Promise.all([
      products.length > 0
        ? supabase.from("landing_products").insert(products.map((p) => ({ ...p, landing_page_id: page.id })))
        : Promise.resolve({ error: null }),
      features.length > 0
        ? supabase.from("landing_features").insert(features.map((f) => ({ ...f, landing_page_id: page.id })))
        : Promise.resolve({ error: null }),
    ]);

    // supabase-js has no cross-table transaction here — if a child insert
    // fails after the parent succeeded, clean up the orphaned parent
    // ourselves rather than leaving a half-created page behind.
    if (productsResult.error || featuresResult.error) {
      await supabase.from("landing_pages").delete().eq("id", page.id);
      return { error: "저장 중 문제가 발생했습니다." };
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/pages");
  redirect(`/admin/pages/${page.id}/edit`);
}

/**
 * Updates only the `landing_pages` row itself (business info, Hero,
 * representative price, template, status). Products/features and every
 * other child table get their own save button/action on the edit page — see
 * `[id]/edit/actions.ts` — so this one never touches child tables and never
 * needs to navigate away; the admin stays on the edit page to keep working
 * through the rest of the content.
 */
export async function updateLandingPageAction(
  id: string,
  _prevState: LandingPageFormState,
  formData: FormData
): Promise<LandingPageFormState> {
  // Outside the try/catch below on purpose: redirect() works by throwing,
  // and a catch-all here would swallow that throw and report a logged-out
  // admin's session as a failed save instead of sending them to /login.
  await requireUser();

  const parsed = parseLandingPageFields(formData);
  if ("error" in parsed) return { error: parsed.error };

  const supabase = await createSupabaseServerClient();

  // supabase-js only returns `{ error }` for a query Postgres/PostgREST
  // itself rejected — a transport-level failure (timeout, connection reset)
  // throws instead. Uncaught, that crashes the whole Server Action, which
  // Next.js turns into an opaque 500/503 response; the client is then left
  // with no `state.error` to show, which is how "저장되었습니다" was seen
  // rendering even though the update never reached the database. Catching
  // it here guarantees this action always resolves to a normal
  // `{ error }`/`{ error: null }` result instead of crashing uncaught.
  let updateError;
  try {
    ({ error: updateError } = await supabase.from("landing_pages").update(parsed.data).eq("id", id));
  } catch (err) {
    console.error("[updateLandingPageAction] unexpected error:", err instanceof Error ? err.message : "unknown");
    return { error: "저장 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요." };
  }
  if (updateError) return { error: mapSupabaseError(updateError) };

  revalidatePath("/admin");
  revalidatePath("/admin/pages");
  revalidatePath(`/admin/pages/${id}/edit`);
  return { error: null };
}

/**
 * Every Storage-backed image URL that could belong to this page, collected
 * BEFORE the delete so there's still something to look up. Child rows
 * (products, cases, their images, the page gallery) all cascade-delete with
 * the parent `landing_pages` row — nothing here reads them again after.
 */
async function collectPageImageUrls(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  landingPageId: string
): Promise<string[]> {
  const [page, products, seo, cases, productImages, galleryImages] = await Promise.all([
    supabase.from("landing_pages").select("logo_url, main_image_url").eq("id", landingPageId).maybeSingle(),
    supabase.from("landing_products").select("image_url").eq("landing_page_id", landingPageId),
    supabase.from("landing_page_seo_settings").select("og_image_url").eq("landing_page_id", landingPageId).maybeSingle(),
    supabase.from("landing_cases").select("image_url").eq("landing_page_id", landingPageId),
    supabase.from("landing_product_images").select("image_url").eq("landing_page_id", landingPageId),
    supabase.from("landing_gallery_images").select("image_url").eq("landing_page_id", landingPageId),
  ]);

  const urls: (string | null | undefined)[] = [
    page.data?.logo_url,
    page.data?.main_image_url,
    seo.data?.og_image_url,
    ...(products.data ?? []).map((p) => p.image_url),
    ...(cases.data ?? []).map((c) => c.image_url),
    ...(productImages.data ?? []).map((i) => i.image_url),
    ...(galleryImages.data ?? []).map((i) => i.image_url),
  ];

  return urls.filter((url): url is string => Boolean(url));
}

export async function deleteLandingPageAction(id: string): Promise<void> {
  await requireUser();

  const supabase = await createSupabaseServerClient();

  // Deliberately NOT a wholesale `storage.remove` of the whole
  // `landing-pages/{id}/` folder — a future page-duplication feature could
  // mean another page's row references one of these same URLs, and this
  // codebase already got burned once (Stage 8) by an unverified assumption
  // about Storage/RLS behavior. Each URL is checked for other references
  // (`removeAssetIfUnreferenced`) after the page (and everything that used
  // to reference it) is gone.
  const imageUrls = await collectPageImageUrls(supabase, id);

  const { error } = await supabase.from("landing_pages").delete().eq("id", id);

  if (error) {
    // No toast/error channel wired to this fire-and-forget button yet — log
    // server-side and leave the row in place rather than pretend it worked.
    console.error("[deleteLandingPageAction] failed:", error.code, error.message);
    return;
  }

  await Promise.all(imageUrls.map((url) => removeAssetIfUnreferenced(supabase, url)));

  revalidatePath("/admin");
  revalidatePath("/admin/pages");
}

export async function toggleLandingPageStatusAction(
  id: string,
  currentStatus: LandingPageStatus
): Promise<void> {
  await requireUser();

  const nextStatus: LandingPageStatus = currentStatus === "public" ? "private" : "public";

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("landing_pages").update({ status: nextStatus }).eq("id", id);

  if (error) {
    console.error("[toggleLandingPageStatusAction] failed:", error.code, error.message);
    return;
  }

  revalidatePath("/admin");
  revalidatePath("/admin/pages");
}
