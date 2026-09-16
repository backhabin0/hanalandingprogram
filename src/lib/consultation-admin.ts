import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { mapConsultationRequestRow, CONSULTATION_STATUSES, INQUIRY_TYPES } from "@/lib/consultation-requests";
import type { ConsultationRequest, ConsultationStatus, InquiryType, LandingItemType } from "@/types/landing";

/**
 * Stage 11 — admin-only reads for `/admin/consultations` (list + detail +
 * dashboard stats). Deliberately separate from `consultation-requests.ts`:
 * that file is imported by `ConsultationForm` (a Client Component), so it
 * can never import `createSupabaseServerClient` (which pulls in
 * `next/headers`) without breaking the client bundle. Everything here does
 * exactly that, so it carries `server-only` to fail the build loudly if it
 * were ever imported from client code instead of just failing at runtime.
 *
 * Every function here relies on the caller having already run
 * `requireUser()` (the admin layout does this for every page under
 * `/admin`, and every mutating Server Action re-checks it itself) — RLS's
 * `authenticated` policies on `consultation_requests` are what actually
 * make these reads legal; this file adds no authorization of its own.
 */

type ConsultationRequestRow = Database["public"]["Tables"]["consultation_requests"]["Row"];

export const CONSULTATION_PAGE_SIZE = 20;

export interface ConsultationListItem extends ConsultationRequest {
  /** null when the landing page has since been deleted. */
  businessName: string | null;
  slug: string | null;
  /** null when no product was selected, or the product has since been deleted. */
  productName: string | null;
  productItemType: LandingItemType | null;
}

export interface ConsultationListFilters {
  q?: string;
  status?: ConsultationStatus;
  inquiryType?: InquiryType;
  landingPageId?: string;
}

/**
 * PostgREST's `or=` filter syntax uses `,` to separate conditions and lets a
 * value contain one by double-quoting it — this quotes+escapes a raw search
 * term so a customer name/phone containing a comma, quote, or parenthesis
 * can't break the filter (or, worse, smuggle in an unintended condition).
 */
function orIlikeValue(raw: string): string {
  const escaped = raw.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"%${escaped}%"`;
}

function applyFilters<Q extends { or(filter: string): Q; eq(column: string, value: string): Q }>(
  query: Q,
  filters: ConsultationListFilters
): Q {
  let q = query;
  if (filters.status && (CONSULTATION_STATUSES as string[]).includes(filters.status)) {
    q = q.eq("status", filters.status);
  }
  if (filters.inquiryType && (INQUIRY_TYPES as string[]).includes(filters.inquiryType)) {
    q = q.eq("inquiry_type", filters.inquiryType);
  }
  if (filters.landingPageId) {
    q = q.eq("landing_page_id", filters.landingPageId);
  }
  const term = filters.q?.trim();
  if (term) {
    const v = orIlikeValue(term);
    q = q.or(`name.ilike.${v},phone.ilike.${v},company_name.ilike.${v}`);
  }
  return q;
}

/** Batch-attaches the landing page / product display fields the list and detail views both need, in two queries total regardless of row count. */
async function attachRelatedData(
  rows: ConsultationRequest[]
): Promise<ConsultationListItem[]> {
  const supabase = await createSupabaseServerClient();

  const pageIds = [...new Set(rows.map((r) => r.landingPageId).filter((v): v is string => Boolean(v)))];
  const productIds = [...new Set(rows.map((r) => r.productId).filter((v): v is string => Boolean(v)))];

  const [pagesRes, productsRes] = await Promise.all([
    pageIds.length > 0
      ? supabase.from("landing_pages").select("id, business_name, slug").in("id", pageIds)
      : Promise.resolve({ data: [] as { id: string; business_name: string; slug: string }[], error: null }),
    productIds.length > 0
      ? supabase.from("landing_products").select("id, name, item_type").in("id", productIds)
      : Promise.resolve({ data: [] as { id: string; name: string; item_type: string }[], error: null }),
  ]);
  if (pagesRes.error) throw pagesRes.error;
  if (productsRes.error) throw productsRes.error;

  const pageMap = new Map(pagesRes.data.map((p) => [p.id, p]));
  const productMap = new Map(productsRes.data.map((p) => [p.id, p]));

  return rows.map((r) => {
    const page = r.landingPageId ? pageMap.get(r.landingPageId) : undefined;
    const product = r.productId ? productMap.get(r.productId) : undefined;
    return {
      ...r,
      businessName: page?.business_name ?? null,
      slug: page?.slug ?? null,
      productName: product?.name ?? null,
      productItemType: product ? (product.item_type === "service" ? "service" : "product") : null,
    };
  });
}

export async function listConsultationRequests(
  filters: ConsultationListFilters,
  page: number
): Promise<{ items: ConsultationListItem[]; total: number; page: number; pageSize: number }> {
  const supabase = await createSupabaseServerClient();
  const safePage = Math.max(1, page);
  const from = (safePage - 1) * CONSULTATION_PAGE_SIZE;
  const to = from + CONSULTATION_PAGE_SIZE - 1;

  const baseQuery = supabase
    .from("consultation_requests")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  const { data, error, count } = await applyFilters(baseQuery, filters);

  if (error) {
    // PostgREST rejects a `.range()` whose offset falls past the actual row
    // count with PGRST103 ("Requested range not satisfiable") instead of
    // just returning zero rows. A page number past the last page — a stale
    // bookmark, a hand-edited URL, the last row on a page getting deleted
    // out from under you — must render as "no results", not a 500. Every
    // other error still throws.
    if (error.code === "PGRST103") {
      const countQuery = supabase.from("consultation_requests").select("*", { count: "exact", head: true });
      const { count: totalCount, error: countError } = await applyFilters(countQuery, filters);
      if (countError) throw countError;
      return { items: [], total: totalCount ?? 0, page: safePage, pageSize: CONSULTATION_PAGE_SIZE };
    }
    throw error;
  }

  const items = await attachRelatedData((data ?? []).map(mapConsultationRequestRow));
  return { items, total: count ?? 0, page: safePage, pageSize: CONSULTATION_PAGE_SIZE };
}

/**
 * Every matching row, unpaginated, for CSV export — capped at 10,000 rows as
 * a sanity bound (no export UI paginates, and nothing at this project's
 * scale should ever approach that), not a real pagination mechanism.
 */
export async function listAllConsultationRequestsForExport(
  filters: ConsultationListFilters
): Promise<ConsultationListItem[]> {
  const supabase = await createSupabaseServerClient();
  const baseQuery = supabase
    .from("consultation_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .range(0, 9999);
  const { data, error } = await applyFilters(baseQuery, filters);

  if (error) {
    // Same PGRST103 case as `listConsultationRequests` — an empty result
    // set (no rows match the filters at all) can make even `.range(0, ...)`
    // unsatisfiable. An export with nothing to export is a valid outcome,
    // not a failure.
    if (error.code === "PGRST103") return [];
    throw error;
  }

  return attachRelatedData((data ?? []).map(mapConsultationRequestRow));
}

export async function getConsultationRequestById(id: string): Promise<ConsultationListItem | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("consultation_requests").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const [item] = await attachRelatedData([mapConsultationRequestRow(data as ConsultationRequestRow)]);
  return item;
}

export async function getRecentConsultationRequests(limit: number): Promise<ConsultationListItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("consultation_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;

  return attachRelatedData((data ?? []).map(mapConsultationRequestRow));
}

/** Dashboard + list-page stat cards: total and per-status counts, 5 lightweight `count`-only queries run in parallel. */
export async function getConsultationStatusCounts(): Promise<Record<ConsultationStatus, number> & { total: number }> {
  const supabase = await createSupabaseServerClient();

  const [totalRes, ...statusResults] = await Promise.all([
    supabase.from("consultation_requests").select("*", { count: "exact", head: true }),
    ...CONSULTATION_STATUSES.map((status) =>
      supabase.from("consultation_requests").select("*", { count: "exact", head: true }).eq("status", status)
    ),
  ]);
  if (totalRes.error) throw totalRes.error;

  const counts = {} as Record<ConsultationStatus, number>;
  CONSULTATION_STATUSES.forEach((status, i) => {
    const res = statusResults[i];
    if (res.error) throw res.error;
    counts[status] = res.count ?? 0;
  });

  return { ...counts, total: totalRes.count ?? 0 };
}
