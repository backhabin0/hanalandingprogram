"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PostgrestError } from "@supabase/supabase-js";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateSlug } from "@/lib/slug";
import { isSafeHttpUrl } from "@/lib/validation";
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
// Error mapping — never surface raw Postgres/PostgREST error text.
// ---------------------------------------------------------------------------

function mapSupabaseError(error: PostgrestError): string {
  if (error.code === "23505") return "이미 사용 중인 URL입니다.";
  if (error.code === "42501") return "저장 권한을 확인해주세요.";
  return "저장 중 문제가 발생했습니다.";
}

// ---------------------------------------------------------------------------
// FormData helpers
// ---------------------------------------------------------------------------

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function toNullable(value: string): string | null {
  return value === "" ? null : value;
}

/**
 * Reads indexed, dotted field groups out of FormData —
 * `products[0].name`, `products[0].shortDescription`, etc — back into an
 * ordered array of `{ name: "...", shortDescription: "..." }` objects.
 */
function parseIndexedGroups(formData: FormData, prefix: string): Record<string, string>[] {
  const pattern = new RegExp(`^${prefix}\\[(\\d+)\\]\\.(\\w+)$`);
  const groups = new Map<number, Record<string, string>>();

  for (const [key, value] of formData.entries()) {
    const match = pattern.exec(key);
    if (!match || typeof value !== "string") continue;

    const index = Number(match[1]);
    const field = match[2];
    if (!groups.has(index)) groups.set(index, {});
    groups.get(index)![field] = value.trim();
  }

  return Array.from(groups.keys())
    .sort((a, b) => a - b)
    .map((index) => groups.get(index)!);
}

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
  redirect("/admin/pages");
}

export async function updateLandingPageAction(
  id: string,
  _prevState: LandingPageFormState,
  formData: FormData
): Promise<LandingPageFormState> {
  await requireUser();

  const parsed = parseLandingPageFields(formData);
  if ("error" in parsed) return { error: parsed.error };

  const products = parseProducts(formData);
  const features = parseFeatures(formData);

  const supabase = await createSupabaseServerClient();

  const { error: updateError } = await supabase.from("landing_pages").update(parsed.data).eq("id", id);
  if (updateError) return { error: mapSupabaseError(updateError) };

  // No stable per-row ids come back from this form (Stage 7 builds that
  // editor), so children are replaced wholesale: delete this page's
  // existing products/features, then re-insert the current form state.
  const [deleteProducts, deleteFeatures] = await Promise.all([
    supabase.from("landing_products").delete().eq("landing_page_id", id),
    supabase.from("landing_features").delete().eq("landing_page_id", id),
  ]);
  if (deleteProducts.error || deleteFeatures.error) {
    return { error: "저장 중 문제가 발생했습니다." };
  }

  const [insertProducts, insertFeatures] = await Promise.all([
    products.length > 0
      ? supabase.from("landing_products").insert(products.map((p) => ({ ...p, landing_page_id: id })))
      : Promise.resolve({ error: null }),
    features.length > 0
      ? supabase.from("landing_features").insert(features.map((f) => ({ ...f, landing_page_id: id })))
      : Promise.resolve({ error: null }),
  ]);
  if (insertProducts.error || insertFeatures.error) {
    return { error: "저장 중 문제가 발생했습니다." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/pages");
  revalidatePath(`/admin/pages/${id}/edit`);
  redirect("/admin/pages");
}

export async function deleteLandingPageAction(id: string): Promise<void> {
  await requireUser();

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("landing_pages").delete().eq("id", id);

  if (error) {
    // No toast/error channel wired to this fire-and-forget button yet — log
    // server-side and leave the row in place rather than pretend it worked.
    console.error("[deleteLandingPageAction] failed:", error.code, error.message);
    return;
  }

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
