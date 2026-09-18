"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapSupabaseError, SAFE_SAVE_ERROR_MESSAGE, logUnexpectedSaveError } from "@/lib/supabase-errors";
import { diffChildRows } from "@/lib/child-sync";
import { getString, toNullable, parseIndexedGroups } from "@/lib/form-data";
import { isSafeHttpUrl } from "@/lib/validation";
import {
  mapCaseRow,
  mapCompanyInfoRow,
  mapFaqRow,
  mapFeatureRow,
  mapMetricRow,
  mapProcessStepRow,
  mapProductRow,
  mapSeoSettingsRow,
  mapSpecificationRow,
} from "@/lib/landing-pages";
import type {
  LandingCase,
  LandingCompanyInfo,
  LandingFaq,
  LandingFeature,
  LandingMetric,
  LandingProcessStep,
  LandingProduct,
  LandingSeoMeta,
  LandingSpecification,
} from "@/types/landing";

/**
 * Server Actions for every child table shown on `/admin/pages/[id]/edit`
 * beyond `landing_pages` itself (that one stays in `../actions.ts`, bound
 * from the shared `LandingPageForm`).
 *
 * Each resource gets its own save button/action rather than one giant
 * page-wide submit — see the Stage 7 report for why: `landing_products.id`
 * is now referenced by `landing_specifications.product_id`, so products can
 * no longer be safely deleted-and-reinserted on every save (Stage 4's
 * approach). Splitting saves per table also means a failure in, say, the
 * FAQ save can't touch products/features/etc — each `sync*` below diffs
 * against the DB by id (`diffChildRows`) and only inserts/updates/deletes
 * exactly what changed.
 *
 * Every update/delete is scoped with both `.eq("id", childId)` AND
 * `.eq("landing_page_id", landingPageId)` — not because RLS allows
 * cross-page tampering by itself (see `002_auth_rls.sql`: any authenticated
 * session can already read/write every row), but so a forged form payload
 * that slips in another page's child id can't mutate that page's data
 * through this action. A mismatched id just matches zero rows.
 */

const CHILD_ORDER = { ascending: true } as const;

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export interface ProductsFormState {
  error: string | null;
  products?: LandingProduct[];
}

const PRODUCT_MAX = {
  name: 150,
  shortDescription: 500,
  description: 10000,
  priceLabel: 100,
  price: 100,
  priceUnit: 50,
  priceNote: 500,
  ctaText: 50,
} as const;

interface ProductRowInput {
  id?: string;
  name: string;
  short_description: string | null;
  description: string | null;
  price_label: string | null;
  price: string | null;
  price_unit: string | null;
  price_description: string | null;
  cta_text: string | null;
  is_active: boolean;
  sort_order: number;
  item_type: "product" | "service";
}

function parseProductRows(formData: FormData): { data: ProductRowInput[] } {
  const rows = parseIndexedGroups(formData, "products").filter((row) => row.name);
  const data: ProductRowInput[] = [];

  rows.forEach((row, index) => {
    if (row.name.length > PRODUCT_MAX.name) {
      throw new ValidationError(`제품명은 ${PRODUCT_MAX.name}자 이하로 입력해주세요.`);
    }
    if ((row.shortDescription ?? "").length > PRODUCT_MAX.shortDescription) {
      throw new ValidationError(`짧은 설명은 ${PRODUCT_MAX.shortDescription}자 이하로 입력해주세요.`);
    }
    if ((row.description ?? "").length > PRODUCT_MAX.description) {
      throw new ValidationError(`상세 설명은 ${PRODUCT_MAX.description}자 이하로 입력해주세요.`);
    }
    if ((row.priceLabel ?? "").length > PRODUCT_MAX.priceLabel) throw new ValidationError("가격 라벨이 너무 깁니다.");
    if ((row.price ?? "").length > PRODUCT_MAX.price) throw new ValidationError("가격 값이 너무 깁니다.");
    if ((row.priceUnit ?? "").length > PRODUCT_MAX.priceUnit) throw new ValidationError("가격 단위가 너무 깁니다.");
    if ((row.priceNote ?? "").length > PRODUCT_MAX.priceNote) throw new ValidationError("가격 설명이 너무 깁니다.");
    if ((row.ctaText ?? "").length > PRODUCT_MAX.ctaText) throw new ValidationError("버튼 문구가 너무 깁니다.");

    data.push({
      id: row.id || undefined,
      name: row.name.slice(0, PRODUCT_MAX.name),
      short_description: toNullable(row.shortDescription ?? ""),
      description: toNullable(row.description ?? ""),
      price_label: toNullable(row.priceLabel ?? ""),
      price: toNullable(row.price ?? ""),
      price_unit: toNullable(row.priceUnit ?? ""),
      price_description: toNullable(row.priceNote ?? ""),
      cta_text: toNullable(row.ctaText ?? ""),
      is_active: row.isActive === "on",
      sort_order: index,
      item_type: row.itemType === "service" ? "service" : "product",
    });
  });

  return { data };
}

/** Thrown by row parsers to short-circuit on the first invalid row. */
class ValidationError extends Error {}

function tryParse<T>(fn: () => T): T | { error: string } {
  try {
    return fn();
  } catch (err) {
    if (err instanceof ValidationError) return { error: err.message };
    throw err;
  }
}

export async function saveLandingProductsAction(
  landingPageId: string,
  _prevState: ProductsFormState,
  formData: FormData
): Promise<ProductsFormState> {
  await requireUser();

  const parsed = tryParse(() => parseProductRows(formData));
  if ("error" in parsed) return { error: parsed.error };
  const { data: rows } = parsed;

  const supabase = await createSupabaseServerClient();

  try {
    const { data: existingRows, error: existingError } = await supabase
      .from("landing_products")
      .select("id")
      .eq("landing_page_id", landingPageId);
    if (existingError) return { error: mapSupabaseError(existingError) };

    const { toInsert, toUpdate, toDeleteIds } = diffChildRows(rows, (existingRows ?? []).map((r) => r.id));

    if (toDeleteIds.length > 0) {
      const { error } = await supabase
        .from("landing_products")
        .delete()
        .in("id", toDeleteIds)
        .eq("landing_page_id", landingPageId);
      if (error) return { error: mapSupabaseError(error) };
    }

    for (const { id, ...fields } of toUpdate) {
      const { error } = await supabase
        .from("landing_products")
        .update(fields)
        .eq("id", id)
        .eq("landing_page_id", landingPageId);
      if (error) return { error: mapSupabaseError(error) };
    }

    if (toInsert.length > 0) {
      const { error } = await supabase
        .from("landing_products")
        .insert(toInsert.map((row) => ({ ...row, landing_page_id: landingPageId })));
      if (error) return { error: mapSupabaseError(error) };
    }

    const { data: fresh, error: freshError } = await supabase
      .from("landing_products")
      .select("*")
      .eq("landing_page_id", landingPageId)
      .order("sort_order", CHILD_ORDER)
      .order("created_at", CHILD_ORDER);
    if (freshError) return { error: mapSupabaseError(freshError) };

    revalidatePath(`/admin/pages/${landingPageId}/edit`);
    return { error: null, products: (fresh ?? []).map(mapProductRow) };
  } catch (err) {
    logUnexpectedSaveError("saveLandingProductsAction", err);
    return { error: SAFE_SAVE_ERROR_MESSAGE };
  }
}

// ---------------------------------------------------------------------------
// Features
// ---------------------------------------------------------------------------

export interface FeaturesFormState {
  error: string | null;
  features?: LandingFeature[];
}

const FEATURE_MAX = { title: 150, description: 2000, icon: 20 } as const;

interface FeatureRowInput {
  id?: string;
  title: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
}

function parseFeatureRows(formData: FormData): { data: FeatureRowInput[] } {
  const rows = parseIndexedGroups(formData, "features").filter((row) => row.title);
  const data: FeatureRowInput[] = [];

  rows.forEach((row, index) => {
    if (row.title.length > FEATURE_MAX.title) throw new ValidationError(`제목은 ${FEATURE_MAX.title}자 이하로 입력해주세요.`);
    if ((row.description ?? "").length > FEATURE_MAX.description) {
      throw new ValidationError(`설명은 ${FEATURE_MAX.description}자 이하로 입력해주세요.`);
    }
    if ((row.icon ?? "").length > FEATURE_MAX.icon) throw new ValidationError("아이콘이 너무 깁니다.");

    data.push({
      id: row.id || undefined,
      title: row.title.slice(0, FEATURE_MAX.title),
      description: toNullable(row.description ?? ""),
      icon: toNullable((row.icon ?? "").slice(0, FEATURE_MAX.icon)),
      is_active: row.isActive === "on",
      sort_order: index,
    });
  });

  return { data };
}

export async function saveLandingFeaturesAction(
  landingPageId: string,
  _prevState: FeaturesFormState,
  formData: FormData
): Promise<FeaturesFormState> {
  await requireUser();

  const parsed = tryParse(() => parseFeatureRows(formData));
  if ("error" in parsed) return { error: parsed.error };
  const { data: rows } = parsed;

  const supabase = await createSupabaseServerClient();

  try {
    const { data: existingRows, error: existingError } = await supabase
      .from("landing_features")
      .select("id")
      .eq("landing_page_id", landingPageId);
    if (existingError) return { error: mapSupabaseError(existingError) };

    const { toInsert, toUpdate, toDeleteIds } = diffChildRows(rows, (existingRows ?? []).map((r) => r.id));

    if (toDeleteIds.length > 0) {
      const { error } = await supabase
        .from("landing_features")
        .delete()
        .in("id", toDeleteIds)
        .eq("landing_page_id", landingPageId);
      if (error) return { error: mapSupabaseError(error) };
    }

    for (const { id, ...fields } of toUpdate) {
      const { error } = await supabase
        .from("landing_features")
        .update(fields)
        .eq("id", id)
        .eq("landing_page_id", landingPageId);
      if (error) return { error: mapSupabaseError(error) };
    }

    if (toInsert.length > 0) {
      const { error } = await supabase
        .from("landing_features")
        .insert(toInsert.map((row) => ({ ...row, landing_page_id: landingPageId })));
      if (error) return { error: mapSupabaseError(error) };
    }

    const { data: fresh, error: freshError } = await supabase
      .from("landing_features")
      .select("*")
      .eq("landing_page_id", landingPageId)
      .order("sort_order", CHILD_ORDER)
      .order("created_at", CHILD_ORDER);
    if (freshError) return { error: mapSupabaseError(freshError) };

    revalidatePath(`/admin/pages/${landingPageId}/edit`);
    return { error: null, features: (fresh ?? []).map(mapFeatureRow) };
  } catch (err) {
    logUnexpectedSaveError("saveLandingFeaturesAction", err);
    return { error: SAFE_SAVE_ERROR_MESSAGE };
  }
}

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

export interface MetricsFormState {
  error: string | null;
  metrics?: LandingMetric[];
}

const METRIC_MAX = { label: 100, value: 100, description: 300 } as const;

interface MetricRowInput {
  id?: string;
  label: string;
  value: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
}

function parseMetricRows(formData: FormData): { data: MetricRowInput[] } {
  const rawRows = parseIndexedGroups(formData, "metrics");
  const data: MetricRowInput[] = [];
  let index = 0;

  for (const row of rawRows) {
    const label = row.label ?? "";
    const value = row.value ?? "";
    if (!label && !value) continue;
    if (!label || !value) throw new ValidationError("실적의 라벨과 값을 모두 입력해주세요.");
    if (label.length > METRIC_MAX.label) throw new ValidationError(`라벨은 ${METRIC_MAX.label}자 이하로 입력해주세요.`);
    if (value.length > METRIC_MAX.value) throw new ValidationError(`값은 ${METRIC_MAX.value}자 이하로 입력해주세요.`);
    if ((row.description ?? "").length > METRIC_MAX.description) {
      throw new ValidationError(`보조 설명은 ${METRIC_MAX.description}자 이하로 입력해주세요.`);
    }

    data.push({
      id: row.id || undefined,
      label,
      value,
      description: toNullable(row.description ?? ""),
      is_active: row.isActive === "on",
      sort_order: index,
    });
    index += 1;
  }

  return { data };
}

export async function saveLandingMetricsAction(
  landingPageId: string,
  _prevState: MetricsFormState,
  formData: FormData
): Promise<MetricsFormState> {
  await requireUser();

  const parsed = tryParse(() => parseMetricRows(formData));
  if ("error" in parsed) return { error: parsed.error };
  const { data: rows } = parsed;

  const supabase = await createSupabaseServerClient();

  try {
    const { data: existingRows, error: existingError } = await supabase
      .from("landing_metrics")
      .select("id")
      .eq("landing_page_id", landingPageId);
    if (existingError) return { error: mapSupabaseError(existingError) };

    const { toInsert, toUpdate, toDeleteIds } = diffChildRows(rows, (existingRows ?? []).map((r) => r.id));

    if (toDeleteIds.length > 0) {
      const { error } = await supabase
        .from("landing_metrics")
        .delete()
        .in("id", toDeleteIds)
        .eq("landing_page_id", landingPageId);
      if (error) return { error: mapSupabaseError(error) };
    }

    for (const { id, ...fields } of toUpdate) {
      const { error } = await supabase
        .from("landing_metrics")
        .update(fields)
        .eq("id", id)
        .eq("landing_page_id", landingPageId);
      if (error) return { error: mapSupabaseError(error) };
    }

    if (toInsert.length > 0) {
      const { error } = await supabase
        .from("landing_metrics")
        .insert(toInsert.map((row) => ({ ...row, landing_page_id: landingPageId })));
      if (error) return { error: mapSupabaseError(error) };
    }

    const { data: fresh, error: freshError } = await supabase
      .from("landing_metrics")
      .select("*")
      .eq("landing_page_id", landingPageId)
      .order("sort_order", CHILD_ORDER)
      .order("created_at", CHILD_ORDER);
    if (freshError) return { error: mapSupabaseError(freshError) };

    revalidatePath(`/admin/pages/${landingPageId}/edit`);
    return { error: null, metrics: (fresh ?? []).map(mapMetricRow) };
  } catch (err) {
    logUnexpectedSaveError("saveLandingMetricsAction", err);
    return { error: SAFE_SAVE_ERROR_MESSAGE };
  }
}

// ---------------------------------------------------------------------------
// Specifications
// ---------------------------------------------------------------------------

export interface SpecificationsFormState {
  error: string | null;
  specifications?: LandingSpecification[];
}

const SPEC_MAX = { groupName: 100, key: 150, value: 500 } as const;

interface SpecificationRowInput {
  id?: string;
  product_id: string | null;
  group_name: string | null;
  spec_key: string;
  spec_value: string;
  is_active: boolean;
  sort_order: number;
}

function parseSpecificationRows(formData: FormData): { data: SpecificationRowInput[] } {
  const rawRows = parseIndexedGroups(formData, "specifications");
  const data: SpecificationRowInput[] = [];
  let index = 0;

  for (const row of rawRows) {
    const key = row.specKey ?? "";
    const value = row.specValue ?? "";
    if (!key && !value) continue;
    if (!key || !value) throw new ValidationError("사양 항목명과 값을 모두 입력해주세요.");
    if (key.length > SPEC_MAX.key) throw new ValidationError(`항목명은 ${SPEC_MAX.key}자 이하로 입력해주세요.`);
    if (value.length > SPEC_MAX.value) throw new ValidationError(`값은 ${SPEC_MAX.value}자 이하로 입력해주세요.`);
    if ((row.groupName ?? "").length > SPEC_MAX.groupName) {
      throw new ValidationError(`그룹명은 ${SPEC_MAX.groupName}자 이하로 입력해주세요.`);
    }

    data.push({
      id: row.id || undefined,
      product_id: row.productId ? row.productId : null,
      group_name: toNullable(row.groupName ?? ""),
      spec_key: key,
      spec_value: value,
      is_active: row.isActive === "on",
      sort_order: index,
    });
    index += 1;
  }

  return { data };
}

export async function saveLandingSpecificationsAction(
  landingPageId: string,
  _prevState: SpecificationsFormState,
  formData: FormData
): Promise<SpecificationsFormState> {
  await requireUser();

  const parsed = tryParse(() => parseSpecificationRows(formData));
  if ("error" in parsed) return { error: parsed.error };
  const { data: rows } = parsed;

  const supabase = await createSupabaseServerClient();

  try {
    // A spec's product_id must belong to THIS landing page — never trust the
    // client's own claim about which page a submitted product id came from.
    const requestedProductIds = [...new Set(rows.map((r) => r.product_id).filter((v): v is string => Boolean(v)))];
    if (requestedProductIds.length > 0) {
      const { data: ownedProducts, error: productError } = await supabase
        .from("landing_products")
        .select("id")
        .eq("landing_page_id", landingPageId)
        .in("id", requestedProductIds);
      if (productError) return { error: mapSupabaseError(productError) };

      const ownedIds = new Set((ownedProducts ?? []).map((p) => p.id));
      if (requestedProductIds.some((pid) => !ownedIds.has(pid))) {
        return { error: "이 페이지에 속하지 않은 제품에는 사양을 연결할 수 없습니다." };
      }
    }

    const { data: existingRows, error: existingError } = await supabase
      .from("landing_specifications")
      .select("id")
      .eq("landing_page_id", landingPageId);
    if (existingError) return { error: mapSupabaseError(existingError) };

    const { toInsert, toUpdate, toDeleteIds } = diffChildRows(rows, (existingRows ?? []).map((r) => r.id));

    if (toDeleteIds.length > 0) {
      const { error } = await supabase
        .from("landing_specifications")
        .delete()
        .in("id", toDeleteIds)
        .eq("landing_page_id", landingPageId);
      if (error) return { error: mapSupabaseError(error) };
    }

    for (const { id, ...fields } of toUpdate) {
      const { error } = await supabase
        .from("landing_specifications")
        .update(fields)
        .eq("id", id)
        .eq("landing_page_id", landingPageId);
      if (error) return { error: mapSupabaseError(error) };
    }

    if (toInsert.length > 0) {
      const { error } = await supabase
        .from("landing_specifications")
        .insert(toInsert.map((row) => ({ ...row, landing_page_id: landingPageId })));
      if (error) return { error: mapSupabaseError(error) };
    }

    const { data: fresh, error: freshError } = await supabase
      .from("landing_specifications")
      .select("*")
      .eq("landing_page_id", landingPageId)
      .order("sort_order", CHILD_ORDER)
      .order("created_at", CHILD_ORDER);
    if (freshError) return { error: mapSupabaseError(freshError) };

    revalidatePath(`/admin/pages/${landingPageId}/edit`);
    return { error: null, specifications: (fresh ?? []).map(mapSpecificationRow) };
  } catch (err) {
    logUnexpectedSaveError("saveLandingSpecificationsAction", err);
    return { error: SAFE_SAVE_ERROR_MESSAGE };
  }
}

// ---------------------------------------------------------------------------
// Process steps
// ---------------------------------------------------------------------------

export interface ProcessStepsFormState {
  error: string | null;
  processSteps?: LandingProcessStep[];
}

const PROCESS_MAX = { title: 150, description: 2000 } as const;

interface ProcessStepRowInput {
  id?: string;
  title: string;
  description: string | null;
  step_number: number | null;
  is_active: boolean;
  sort_order: number;
}

function parseProcessStepRows(formData: FormData): { data: ProcessStepRowInput[] } {
  const rows = parseIndexedGroups(formData, "processSteps").filter((row) => row.title);
  const data: ProcessStepRowInput[] = [];

  rows.forEach((row, index) => {
    if (row.title.length > PROCESS_MAX.title) throw new ValidationError(`제목은 ${PROCESS_MAX.title}자 이하로 입력해주세요.`);
    if ((row.description ?? "").length > PROCESS_MAX.description) {
      throw new ValidationError(`설명은 ${PROCESS_MAX.description}자 이하로 입력해주세요.`);
    }

    const rawStepNumber = row.stepNumber ?? "";
    const stepNumber = rawStepNumber === "" ? null : Number.parseInt(rawStepNumber, 10);

    data.push({
      id: row.id || undefined,
      title: row.title.slice(0, PROCESS_MAX.title),
      description: toNullable(row.description ?? ""),
      step_number: stepNumber !== null && Number.isFinite(stepNumber) ? stepNumber : null,
      is_active: row.isActive === "on",
      sort_order: index,
    });
  });

  return { data };
}

export async function saveLandingProcessStepsAction(
  landingPageId: string,
  _prevState: ProcessStepsFormState,
  formData: FormData
): Promise<ProcessStepsFormState> {
  await requireUser();

  const parsed = tryParse(() => parseProcessStepRows(formData));
  if ("error" in parsed) return { error: parsed.error };
  const { data: rows } = parsed;

  const supabase = await createSupabaseServerClient();

  try {
    const { data: existingRows, error: existingError } = await supabase
      .from("landing_process_steps")
      .select("id")
      .eq("landing_page_id", landingPageId);
    if (existingError) return { error: mapSupabaseError(existingError) };

    const { toInsert, toUpdate, toDeleteIds } = diffChildRows(rows, (existingRows ?? []).map((r) => r.id));

    if (toDeleteIds.length > 0) {
      const { error } = await supabase
        .from("landing_process_steps")
        .delete()
        .in("id", toDeleteIds)
        .eq("landing_page_id", landingPageId);
      if (error) return { error: mapSupabaseError(error) };
    }

    for (const { id, ...fields } of toUpdate) {
      const { error } = await supabase
        .from("landing_process_steps")
        .update(fields)
        .eq("id", id)
        .eq("landing_page_id", landingPageId);
      if (error) return { error: mapSupabaseError(error) };
    }

    if (toInsert.length > 0) {
      const { error } = await supabase
        .from("landing_process_steps")
        .insert(toInsert.map((row) => ({ ...row, landing_page_id: landingPageId })));
      if (error) return { error: mapSupabaseError(error) };
    }

    const { data: fresh, error: freshError } = await supabase
      .from("landing_process_steps")
      .select("*")
      .eq("landing_page_id", landingPageId)
      .order("sort_order", CHILD_ORDER)
      .order("created_at", CHILD_ORDER);
    if (freshError) return { error: mapSupabaseError(freshError) };

    revalidatePath(`/admin/pages/${landingPageId}/edit`);
    return { error: null, processSteps: (fresh ?? []).map(mapProcessStepRow) };
  } catch (err) {
    logUnexpectedSaveError("saveLandingProcessStepsAction", err);
    return { error: SAFE_SAVE_ERROR_MESSAGE };
  }
}

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------

export interface FaqsFormState {
  error: string | null;
  faqs?: LandingFaq[];
}

const FAQ_MAX = { question: 300, answer: 5000 } as const;

interface FaqRowInput {
  id?: string;
  question: string;
  answer: string;
  is_active: boolean;
  sort_order: number;
}

function parseFaqRows(formData: FormData): { data: FaqRowInput[] } {
  const rawRows = parseIndexedGroups(formData, "faqs");
  const data: FaqRowInput[] = [];
  let index = 0;

  for (const row of rawRows) {
    const question = row.question ?? "";
    const answer = row.answer ?? "";
    if (!question && !answer) continue;
    if (!question || !answer) throw new ValidationError("질문과 답변을 모두 입력해주세요.");
    if (question.length > FAQ_MAX.question) throw new ValidationError(`질문은 ${FAQ_MAX.question}자 이하로 입력해주세요.`);
    if (answer.length > FAQ_MAX.answer) throw new ValidationError(`답변은 ${FAQ_MAX.answer}자 이하로 입력해주세요.`);

    data.push({
      id: row.id || undefined,
      question,
      answer,
      is_active: row.isActive === "on",
      sort_order: index,
    });
    index += 1;
  }

  return { data };
}

export async function saveLandingFaqsAction(
  landingPageId: string,
  _prevState: FaqsFormState,
  formData: FormData
): Promise<FaqsFormState> {
  await requireUser();

  const parsed = tryParse(() => parseFaqRows(formData));
  if ("error" in parsed) return { error: parsed.error };
  const { data: rows } = parsed;

  const supabase = await createSupabaseServerClient();

  try {
    const { data: existingRows, error: existingError } = await supabase
      .from("landing_faqs")
      .select("id")
      .eq("landing_page_id", landingPageId);
    if (existingError) return { error: mapSupabaseError(existingError) };

    const { toInsert, toUpdate, toDeleteIds } = diffChildRows(rows, (existingRows ?? []).map((r) => r.id));

    if (toDeleteIds.length > 0) {
      const { error } = await supabase
        .from("landing_faqs")
        .delete()
        .in("id", toDeleteIds)
        .eq("landing_page_id", landingPageId);
      if (error) return { error: mapSupabaseError(error) };
    }

    for (const { id, ...fields } of toUpdate) {
      const { error } = await supabase
        .from("landing_faqs")
        .update(fields)
        .eq("id", id)
        .eq("landing_page_id", landingPageId);
      if (error) return { error: mapSupabaseError(error) };
    }

    if (toInsert.length > 0) {
      const { error } = await supabase
        .from("landing_faqs")
        .insert(toInsert.map((row) => ({ ...row, landing_page_id: landingPageId })));
      if (error) return { error: mapSupabaseError(error) };
    }

    const { data: fresh, error: freshError } = await supabase
      .from("landing_faqs")
      .select("*")
      .eq("landing_page_id", landingPageId)
      .order("sort_order", CHILD_ORDER)
      .order("created_at", CHILD_ORDER);
    if (freshError) return { error: mapSupabaseError(freshError) };

    revalidatePath(`/admin/pages/${landingPageId}/edit`);
    return { error: null, faqs: (fresh ?? []).map(mapFaqRow) };
  } catch (err) {
    logUnexpectedSaveError("saveLandingFaqsAction", err);
    return { error: SAFE_SAVE_ERROR_MESSAGE };
  }
}

// ---------------------------------------------------------------------------
// Company info (1:1)
// ---------------------------------------------------------------------------

export interface CompanyInfoFormState {
  error: string | null;
  companyInfo?: LandingCompanyInfo;
}

const COMPANY_MAX = {
  companyName: 100,
  representative: 100,
  businessNumber: 50,
  email: 150,
  customerCenter: 100,
  businessHours: 100,
  address: 300,
  establishedYear: 10,
  footerDescription: 3000,
} as const;

export async function saveLandingCompanyInfoAction(
  landingPageId: string,
  _prevState: CompanyInfoFormState,
  formData: FormData
): Promise<CompanyInfoFormState> {
  await requireUser();

  const companyName = getString(formData, "companyName");
  const representative = getString(formData, "representative");
  const businessNumber = getString(formData, "businessNumber");
  const email = getString(formData, "email");
  const customerCenter = getString(formData, "customerCenter");
  const businessHours = getString(formData, "businessHours");
  const address = getString(formData, "address");
  const establishedYear = getString(formData, "establishedYear");
  const footerDescription = getString(formData, "footerDescription");

  if (companyName.length > COMPANY_MAX.companyName) return { error: "회사명이 너무 깁니다." };
  if (representative.length > COMPANY_MAX.representative) return { error: "대표자명이 너무 깁니다." };
  if (businessNumber.length > COMPANY_MAX.businessNumber) return { error: "사업자등록번호가 너무 깁니다." };
  if (email.length > COMPANY_MAX.email) return { error: "이메일이 너무 깁니다." };
  if (customerCenter.length > COMPANY_MAX.customerCenter) return { error: "고객센터 정보가 너무 깁니다." };
  if (businessHours.length > COMPANY_MAX.businessHours) return { error: "영업시간이 너무 깁니다." };
  if (address.length > COMPANY_MAX.address) return { error: "주소가 너무 깁니다." };
  if (establishedYear.length > COMPANY_MAX.establishedYear) return { error: "설립연도가 너무 깁니다." };
  if (footerDescription.length > COMPANY_MAX.footerDescription) return { error: "푸터 설명이 너무 깁니다." };

  const supabase = await createSupabaseServerClient();

  try {
    const { error } = await supabase.from("landing_company_info").upsert(
      {
        landing_page_id: landingPageId,
        company_name: toNullable(companyName),
        representative_name: toNullable(representative),
        business_number: toNullable(businessNumber),
        email: toNullable(email),
        customer_center: toNullable(customerCenter),
        business_hours: toNullable(businessHours),
        address_detail: toNullable(address),
        established_year: toNullable(establishedYear),
        footer_description: toNullable(footerDescription),
      },
      { onConflict: "landing_page_id" }
    );
    if (error) return { error: mapSupabaseError(error) };

    const { data: fresh, error: freshError } = await supabase
      .from("landing_company_info")
      .select("*")
      .eq("landing_page_id", landingPageId)
      .maybeSingle();
    if (freshError) return { error: mapSupabaseError(freshError) };

    revalidatePath(`/admin/pages/${landingPageId}/edit`);
    return { error: null, companyInfo: fresh ? mapCompanyInfoRow(fresh) : undefined };
  } catch (err) {
    logUnexpectedSaveError("saveLandingCompanyInfoAction", err);
    return { error: SAFE_SAVE_ERROR_MESSAGE };
  }
}

// ---------------------------------------------------------------------------
// SEO settings (1:1)
// ---------------------------------------------------------------------------

export interface SeoSettingsFormState {
  error: string | null;
  seo?: LandingSeoMeta;
}

const SEO_MAX = {
  seoTitle: 100,
  seoDescription: 300,
  ogTitle: 100,
  ogDescription: 300,
  ogImageUrl: 500,
  businessCategory: 100,
  serviceArea: 200,
  primaryKeyword: 100,
  secondaryKeyword: 60,
  localityDescription: 500,
} as const;

const MAX_SECONDARY_KEYWORDS = 10;

/** Comma-separated free text -> a trimmed, deduped, capped keyword list. Never used to build a meta keywords tag — see src/lib/seo/resolve.ts. */
function parseSecondaryKeywords(raw: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of raw.split(",")) {
    const value = part.trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    result.push(value.slice(0, SEO_MAX.secondaryKeyword));
    if (result.length >= MAX_SECONDARY_KEYWORDS) break;
  }
  return result;
}

export async function saveLandingSeoSettingsAction(
  landingPageId: string,
  _prevState: SeoSettingsFormState,
  formData: FormData
): Promise<SeoSettingsFormState> {
  await requireUser();

  const seoTitle = getString(formData, "seoTitle");
  const seoDescription = getString(formData, "seoDescription");
  const ogTitle = getString(formData, "ogTitle");
  const ogDescription = getString(formData, "ogDescription");
  const ogImageUrl = getString(formData, "ogImageUrl");
  const businessCategory = getString(formData, "businessCategory");
  const serviceArea = getString(formData, "serviceArea");
  const primaryKeyword = getString(formData, "primaryKeyword");
  const secondaryKeywordsRaw = getString(formData, "secondaryKeywords");
  const localityDescription = getString(formData, "localityDescription");
  const seoNoindex = formData.get("seoNoindex") === "on";

  if (seoTitle.length > SEO_MAX.seoTitle) return { error: `SEO 제목은 ${SEO_MAX.seoTitle}자 이하로 입력해주세요.` };
  if (seoDescription.length > SEO_MAX.seoDescription) {
    return { error: `SEO 설명은 ${SEO_MAX.seoDescription}자 이하로 입력해주세요.` };
  }
  if (ogTitle.length > SEO_MAX.ogTitle) return { error: `OG 제목은 ${SEO_MAX.ogTitle}자 이하로 입력해주세요.` };
  if (ogDescription.length > SEO_MAX.ogDescription) {
    return { error: `OG 설명은 ${SEO_MAX.ogDescription}자 이하로 입력해주세요.` };
  }
  if (ogImageUrl && (ogImageUrl.length > SEO_MAX.ogImageUrl || !isSafeHttpUrl(ogImageUrl))) {
    return { error: "OG 이미지 URL이 올바르지 않습니다. http(s):// 로 시작하는 주소를 입력해주세요." };
  }
  if (businessCategory.length > SEO_MAX.businessCategory) return { error: "대표 업종이 너무 깁니다." };
  if (serviceArea.length > SEO_MAX.serviceArea) return { error: "서비스 지역이 너무 깁니다." };
  if (primaryKeyword.length > SEO_MAX.primaryKeyword) return { error: "대표 검색어가 너무 깁니다." };
  if (localityDescription.length > SEO_MAX.localityDescription) return { error: "지역 설명이 너무 깁니다." };

  const secondaryKeywords = parseSecondaryKeywords(secondaryKeywordsRaw);

  const supabase = await createSupabaseServerClient();

  try {
    const { error } = await supabase.from("landing_page_seo_settings").upsert(
      {
        landing_page_id: landingPageId,
        seo_title: toNullable(seoTitle),
        seo_description: toNullable(seoDescription),
        og_title: toNullable(ogTitle),
        og_description: toNullable(ogDescription),
        og_image_url: toNullable(ogImageUrl),
        seo_noindex: seoNoindex,
        business_category: toNullable(businessCategory),
        service_area: toNullable(serviceArea),
        primary_keyword: toNullable(primaryKeyword),
        secondary_keywords: secondaryKeywords.length > 0 ? secondaryKeywords : null,
        locality_description: toNullable(localityDescription),
      },
      { onConflict: "landing_page_id" }
    );
    if (error) return { error: mapSupabaseError(error) };

    const { data: fresh, error: freshError } = await supabase
      .from("landing_page_seo_settings")
      .select("*")
      .eq("landing_page_id", landingPageId)
      .maybeSingle();
    if (freshError) return { error: mapSupabaseError(freshError) };

    revalidatePath(`/admin/pages/${landingPageId}/edit`);
    revalidatePath("/[slug]", "page");
    return { error: null, seo: fresh ? mapSeoSettingsRow(fresh) : undefined };
  } catch (err) {
    logUnexpectedSaveError("saveLandingSeoSettingsAction", err);
    return { error: SAFE_SAVE_ERROR_MESSAGE };
  }
}

// ---------------------------------------------------------------------------
// Cases (설치/시공/이용 사례)
// ---------------------------------------------------------------------------

export interface CasesFormState {
  error: string | null;
  cases?: LandingCase[];
}

const CASE_MAX = {
  title: 150,
  description: 3000,
  region: 100,
  industry: 100,
  imageUrl: 500,
} as const;

interface CaseRowInput {
  id?: string;
  product_id: string | null;
  title: string;
  description: string | null;
  region: string | null;
  industry: string | null;
  case_date: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseCaseRows(formData: FormData): { data: CaseRowInput[] } {
  const rows = parseIndexedGroups(formData, "cases").filter((row) => row.title);
  const data: CaseRowInput[] = [];

  rows.forEach((row, index) => {
    if (row.title.length > CASE_MAX.title) throw new ValidationError(`제목은 ${CASE_MAX.title}자 이하로 입력해주세요.`);
    if ((row.description ?? "").length > CASE_MAX.description) {
      throw new ValidationError(`설명은 ${CASE_MAX.description}자 이하로 입력해주세요.`);
    }
    if ((row.region ?? "").length > CASE_MAX.region) throw new ValidationError("지역이 너무 깁니다.");
    if ((row.industry ?? "").length > CASE_MAX.industry) throw new ValidationError("업종이 너무 깁니다.");

    const imageUrl = row.imageUrl ?? "";
    if (imageUrl && (imageUrl.length > CASE_MAX.imageUrl || !isSafeHttpUrl(imageUrl))) {
      throw new ValidationError("이미지 URL이 올바르지 않습니다. http(s):// 로 시작하는 주소를 입력해주세요.");
    }

    const caseDate = row.caseDate ?? "";
    if (caseDate && !DATE_ONLY_PATTERN.test(caseDate)) {
      throw new ValidationError("날짜 형식이 올바르지 않습니다.");
    }

    data.push({
      id: row.id || undefined,
      product_id: row.productId ? row.productId : null,
      title: row.title.slice(0, CASE_MAX.title),
      description: toNullable(row.description ?? ""),
      region: toNullable(row.region ?? ""),
      industry: toNullable(row.industry ?? ""),
      case_date: caseDate ? caseDate : null,
      image_url: toNullable(imageUrl),
      is_active: row.isActive === "on",
      sort_order: index,
    });
  });

  return { data };
}

export async function saveLandingCasesAction(
  landingPageId: string,
  _prevState: CasesFormState,
  formData: FormData
): Promise<CasesFormState> {
  await requireUser();

  const parsed = tryParse(() => parseCaseRows(formData));
  if ("error" in parsed) return { error: parsed.error };
  const { data: rows } = parsed;

  const supabase = await createSupabaseServerClient();

  try {
    // A case's product_id must belong to THIS landing page — same rule as
    // landing_specifications.product_id (see saveLandingSpecificationsAction).
    const requestedProductIds = [...new Set(rows.map((r) => r.product_id).filter((v): v is string => Boolean(v)))];
    if (requestedProductIds.length > 0) {
      const { data: ownedProducts, error: productError } = await supabase
        .from("landing_products")
        .select("id")
        .eq("landing_page_id", landingPageId)
        .in("id", requestedProductIds);
      if (productError) return { error: mapSupabaseError(productError) };

      const ownedIds = new Set((ownedProducts ?? []).map((p) => p.id));
      if (requestedProductIds.some((pid) => !ownedIds.has(pid))) {
        return { error: "이 페이지에 속하지 않은 제품에는 사례를 연결할 수 없습니다." };
      }
    }

    const { data: existingRows, error: existingError } = await supabase
      .from("landing_cases")
      .select("id")
      .eq("landing_page_id", landingPageId);
    if (existingError) return { error: mapSupabaseError(existingError) };

    const { toInsert, toUpdate, toDeleteIds } = diffChildRows(rows, (existingRows ?? []).map((r) => r.id));

    if (toDeleteIds.length > 0) {
      const { error } = await supabase
        .from("landing_cases")
        .delete()
        .in("id", toDeleteIds)
        .eq("landing_page_id", landingPageId);
      if (error) return { error: mapSupabaseError(error) };
    }

    for (const { id, ...fields } of toUpdate) {
      const { error } = await supabase
        .from("landing_cases")
        .update(fields)
        .eq("id", id)
        .eq("landing_page_id", landingPageId);
      if (error) return { error: mapSupabaseError(error) };
    }

    if (toInsert.length > 0) {
      const { error } = await supabase
        .from("landing_cases")
        .insert(toInsert.map((row) => ({ ...row, landing_page_id: landingPageId })));
      if (error) return { error: mapSupabaseError(error) };
    }

    const { data: fresh, error: freshError } = await supabase
      .from("landing_cases")
      .select("*")
      .eq("landing_page_id", landingPageId)
      .order("sort_order", CHILD_ORDER)
      .order("created_at", CHILD_ORDER);
    if (freshError) return { error: mapSupabaseError(freshError) };

    revalidatePath(`/admin/pages/${landingPageId}/edit`);
    revalidatePath("/[slug]", "page");
    return { error: null, cases: (fresh ?? []).map(mapCaseRow) };
  } catch (err) {
    logUnexpectedSaveError("saveLandingCasesAction", err);
    return { error: SAFE_SAVE_ERROR_MESSAGE };
  }
}
