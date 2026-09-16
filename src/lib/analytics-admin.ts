import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PostgrestError } from "@supabase/supabase-js";
import { ANALYTICS_EVENT_TYPES } from "@/lib/analytics-events";
import type { AnalyticsEventType, LandingItemType } from "@/types/landing";

/**
 * Stage 12 — admin-only reads for `/admin/analytics` (and the dashboard's
 * "최근 7일" card). Same reasoning as `consultation-admin.ts`: this pulls in
 * `createSupabaseServerClient` (server-only via `next/headers`), so it must
 * never be imported from a Client Component — `server-only` fails the build
 * loudly if that ever happens by mistake.
 *
 * Every function here relies on the caller having already run
 * `requireUser()` (the admin layout does this for every `/admin/*` page) —
 * RLS's `authenticated` SELECT policy on `landing_page_events` /
 * `consultation_requests` is what actually makes these reads legal; this
 * file adds no authorization of its own.
 */

const PAGE_SIZE = 1000;

/**
 * Pages through `.range()` until a short page confirms there's nothing
 * left, accumulating every matching row. At this project's current scale
 * this is one request; the loop exists so a future high-volume period never
 * *silently* truncates at PostgREST's default page size — Stage 12 spec
 * explicitly calls this out. See the Stage 12 report for the daily-
 * aggregate-table upgrade path once volume actually warrants it.
 */
async function fetchAllRows<T>(
  queryForRange: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: PostgrestError | null }>
): Promise<T[]> {
  const all: T[] = [];
  let start = 0;
  for (;;) {
    const { data, error } = await queryForRange(start, start + PAGE_SIZE - 1);
    if (error) throw error;
    const rows = data ?? [];
    all.push(...rows);
    if (rows.length < PAGE_SIZE) return all;
    start += PAGE_SIZE;
  }
}

export interface AnalyticsRange {
  from: Date;
  to: Date;
}

/**
 * "Last N days" as a real UTC instant range that respects Asia/Seoul
 * calendar-day boundaries — e.g. `days=7` on a KST evening includes today
 * so far plus the 6 full KST days before it, not a naive 7*24h rolling
 * window that can straddle KST midnight incorrectly.
 */
export function getKstDayRange(days: 7 | 30 | 90): AnalyticsRange {
  const now = new Date();
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const kstMidnightTodayAsUtc = Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate(), 0, 0, 0);
  const trueUtcMidnightToday = new Date(kstMidnightTodayAsUtc - 9 * 60 * 60 * 1000);
  const from = new Date(trueUtcMidnightToday.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
  return { from, to: now };
}

/** "YYYY-MM-DD" in Asia/Seoul — used to bucket a UTC timestamp into the correct KST calendar day. */
function toKstDateString(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(iso));
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Every KST calendar date string from `from` through `to`, inclusive — so the trend chart has a zero-filled row for days with no events, not gaps. */
function kstDateSequence(range: AnalyticsRange): string[] {
  const dates: string[] = [];
  const cursor = new Date(range.from);
  const endDateStr = toKstDateString(range.to.toISOString());
  for (let i = 0; i < 400; i++) {
    const dateStr = toKstDateString(cursor.toISOString());
    dates.push(dateStr);
    if (dateStr === endDateStr) break;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

interface RawEventRow {
  event_type: string;
  landing_page_id: string | null;
  product_id: string | null;
  created_at: string;
}

interface RawConsultationRow {
  landing_page_id: string | null;
  product_id: string | null;
  created_at: string;
}

export interface AnalyticsSummary {
  pageViews: number;
  phoneClicks: number;
  kakaoClicks: number;
  productCtaClicks: number;
  quoteCtaClicks: number;
  consultations: number;
}

export interface DailyTrendPoint {
  date: string;
  pageViews: number;
  consultations: number;
}

export interface PagePerformanceRow {
  landingPageId: string | null;
  businessName: string | null;
  slug: string | null;
  pageViews: number;
  phoneClicks: number;
  kakaoClicks: number;
  productCtaClicks: number;
  quoteCtaClicks: number;
  consultations: number;
}

export interface ProductPerformanceRow {
  productId: string;
  productName: string | null;
  landingPageId: string | null;
  businessName: string | null;
  itemType: LandingItemType | null;
  productCtaClicks: number;
  consultations: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  dailyTrend: DailyTrendPoint[];
  pagePerformance: PagePerformanceRow[];
  productPerformance: ProductPerformanceRow[];
}

function emptyCounts(): Record<AnalyticsEventType, number> {
  const counts = {} as Record<AnalyticsEventType, number>;
  for (const type of ANALYTICS_EVENT_TYPES) counts[type] = 0;
  return counts;
}

export async function getAnalyticsData(range: AnalyticsRange, landingPageId?: string): Promise<AnalyticsData> {
  const supabase = await createSupabaseServerClient();
  const fromIso = range.from.toISOString();
  const toIso = range.to.toISOString();

  const events = await fetchAllRows<RawEventRow>((from, to) => {
    let query = supabase
      .from("landing_page_events")
      .select("event_type, landing_page_id, product_id, created_at")
      .gte("created_at", fromIso)
      .lte("created_at", toIso)
      .order("created_at", { ascending: true })
      .range(from, to);
    if (landingPageId) query = query.eq("landing_page_id", landingPageId);
    return query;
  });

  const consultations = await fetchAllRows<RawConsultationRow>((from, to) => {
    let query = supabase
      .from("consultation_requests")
      .select("landing_page_id, product_id, created_at")
      .gte("created_at", fromIso)
      .lte("created_at", toIso)
      .order("created_at", { ascending: true })
      .range(from, to);
    if (landingPageId) query = query.eq("landing_page_id", landingPageId);
    return query;
  });

  // ---- summary ----
  const summary: AnalyticsSummary = {
    pageViews: 0,
    phoneClicks: 0,
    kakaoClicks: 0,
    productCtaClicks: 0,
    quoteCtaClicks: 0,
    consultations: consultations.length,
  };
  for (const e of events) {
    if (e.event_type === "page_view") summary.pageViews++;
    else if (e.event_type === "phone_click") summary.phoneClicks++;
    else if (e.event_type === "kakao_click") summary.kakaoClicks++;
    else if (e.event_type === "product_cta_click") summary.productCtaClicks++;
    else if (e.event_type === "quote_cta_click") summary.quoteCtaClicks++;
  }

  // ---- daily trend (zero-filled) ----
  const trendMap = new Map<string, { pageViews: number; consultations: number }>();
  for (const dateStr of kstDateSequence(range)) trendMap.set(dateStr, { pageViews: 0, consultations: 0 });
  for (const e of events) {
    if (e.event_type !== "page_view") continue;
    const bucket = trendMap.get(toKstDateString(e.created_at));
    if (bucket) bucket.pageViews++;
  }
  for (const c of consultations) {
    const bucket = trendMap.get(toKstDateString(c.created_at));
    if (bucket) bucket.consultations++;
  }
  const dailyTrend: DailyTrendPoint[] = [...trendMap.entries()].map(([date, v]) => ({ date, ...v }));

  // ---- per-page breakdown ----
  const pageIds = [...new Set(events.map((e) => e.landing_page_id).concat(consultations.map((c) => c.landing_page_id)).filter((v): v is string => Boolean(v)))];
  const productIds = [...new Set(events.map((e) => e.product_id).concat(consultations.map((c) => c.product_id)).filter((v): v is string => Boolean(v)))];

  const [pagesRes, productsRes] = await Promise.all([
    pageIds.length > 0
      ? supabase.from("landing_pages").select("id, business_name, slug").in("id", pageIds)
      : Promise.resolve({ data: [] as { id: string; business_name: string; slug: string }[], error: null }),
    productIds.length > 0
      ? supabase.from("landing_products").select("id, name, item_type, landing_page_id").in("id", productIds)
      : Promise.resolve({ data: [] as { id: string; name: string; item_type: string; landing_page_id: string }[], error: null }),
  ]);
  if (pagesRes.error) throw pagesRes.error;
  if (productsRes.error) throw productsRes.error;

  const pageMap = new Map(pagesRes.data.map((p) => [p.id, p]));
  const productMap = new Map(productsRes.data.map((p) => [p.id, p]));

  type PageAgg = Omit<PagePerformanceRow, "landingPageId" | "businessName" | "slug"> & { key: string | null };
  const pageAgg = new Map<string | null, PageAgg>();
  function pageBucket(id: string | null): PageAgg {
    let bucket = pageAgg.get(id);
    if (!bucket) {
      bucket = { key: id, pageViews: 0, phoneClicks: 0, kakaoClicks: 0, productCtaClicks: 0, quoteCtaClicks: 0, consultations: 0 };
      pageAgg.set(id, bucket);
    }
    return bucket;
  }
  for (const e of events) {
    const bucket = pageBucket(e.landing_page_id);
    const counts = emptyCounts();
    counts[e.event_type as AnalyticsEventType] = 1;
    bucket.pageViews += counts.page_view;
    bucket.phoneClicks += counts.phone_click;
    bucket.kakaoClicks += counts.kakao_click;
    bucket.productCtaClicks += counts.product_cta_click;
    bucket.quoteCtaClicks += counts.quote_cta_click;
  }
  for (const c of consultations) {
    pageBucket(c.landing_page_id).consultations++;
  }
  const pagePerformance: PagePerformanceRow[] = [...pageAgg.values()]
    .map((bucket) => {
      const page = bucket.key ? pageMap.get(bucket.key) : undefined;
      return {
        landingPageId: bucket.key,
        businessName: page?.business_name ?? null,
        slug: page?.slug ?? null,
        pageViews: bucket.pageViews,
        phoneClicks: bucket.phoneClicks,
        kakaoClicks: bucket.kakaoClicks,
        productCtaClicks: bucket.productCtaClicks,
        quoteCtaClicks: bucket.quoteCtaClicks,
        consultations: bucket.consultations,
      };
    })
    .sort((a, b) => b.pageViews - a.pageViews);

  // ---- per-product breakdown ----
  type ProductAgg = { productCtaClicks: number; consultations: number };
  const productAgg = new Map<string, ProductAgg>();
  function productBucket(id: string): ProductAgg {
    let bucket = productAgg.get(id);
    if (!bucket) {
      bucket = { productCtaClicks: 0, consultations: 0 };
      productAgg.set(id, bucket);
    }
    return bucket;
  }
  for (const e of events) {
    if (e.event_type === "product_cta_click" && e.product_id) productBucket(e.product_id).productCtaClicks++;
  }
  for (const c of consultations) {
    if (c.product_id) productBucket(c.product_id).consultations++;
  }
  const productPerformance: ProductPerformanceRow[] = [...productAgg.entries()]
    .map(([productId, bucket]): ProductPerformanceRow => {
      const product = productMap.get(productId);
      const page = product ? pageMap.get(product.landing_page_id) : undefined;
      const itemType: LandingItemType | null = product ? (product.item_type === "service" ? "service" : "product") : null;
      return {
        productId,
        productName: product?.name ?? null,
        landingPageId: product?.landing_page_id ?? null,
        businessName: page?.business_name ?? null,
        itemType,
        productCtaClicks: bucket.productCtaClicks,
        consultations: bucket.consultations,
      };
    })
    .sort((a, b) => b.productCtaClicks - a.productCtaClicks);

  return { summary, dailyTrend, pagePerformance, productPerformance };
}

/** Lightweight "최근 7일 조회수" for the dashboard card — same range helper, page_view count only. */
export async function getRecentPageViewCount(days: 7 = 7): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const range = getKstDayRange(days);
  const { count, error } = await supabase
    .from("landing_page_events")
    .select("*", { count: "exact", head: true })
    .eq("event_type", "page_view")
    .gte("created_at", range.from.toISOString())
    .lte("created_at", range.to.toISOString());
  if (error) throw error;
  return count ?? 0;
}
