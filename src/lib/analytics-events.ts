import type { AnalyticsEventType } from "@/types/landing";

/**
 * Stage 12 — conversion-focused analytics events. Shared by the client
 * tracker (`analytics-client.ts`, `components/analytics/*`) and the
 * validating API route (`app/api/analytics/route.ts`), so this file must
 * stay import-safe from Client Components: no `createSupabaseServerClient`,
 * no `next/headers`, no server-only secrets.
 */

export const ANALYTICS_EVENT_TYPES: AnalyticsEventType[] = [
  "page_view",
  "phone_click",
  "kakao_click",
  "product_cta_click",
  "quote_cta_click",
];

export const ANALYTICS_EVENT_LABEL: Record<AnalyticsEventType, string> = {
  page_view: "페이지 조회",
  phone_click: "전화 클릭",
  kakao_click: "카카오 클릭",
  product_cta_click: "제품 CTA 클릭",
  quote_cta_click: "견적 CTA 클릭",
};

const SLUG_MAX_LENGTH = 200;

/** Raw payload as sent by `trackLandingEvent()`, before server-side validation. */
export interface AnalyticsTrackRequest {
  slug: string;
  eventType: AnalyticsEventType;
  productId?: string | null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(value: string): boolean {
  return UUID_RE.test(value);
}

/**
 * Field-shape/allowlist validation only — this can't confirm the page is
 * public or that `productId` actually belongs to it, since both require a
 * DB round trip. The API route does those checks separately after this
 * passes (see `app/api/analytics/route.ts`).
 */
export function validateAnalyticsTrackRequest(
  body: unknown
): { ok: true; data: AnalyticsTrackRequest } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "잘못된 요청입니다." };
  }
  const { slug, eventType, productId } = body as Record<string, unknown>;

  if (typeof slug !== "string" || !slug.trim() || slug.length > SLUG_MAX_LENGTH) {
    return { ok: false, error: "잘못된 요청입니다." };
  }
  if (typeof eventType !== "string" || !(ANALYTICS_EVENT_TYPES as string[]).includes(eventType)) {
    return { ok: false, error: "잘못된 이벤트 유형입니다." };
  }
  if (productId !== undefined && productId !== null) {
    if (typeof productId !== "string" || !isValidUuid(productId)) {
      return { ok: false, error: "잘못된 제품 정보입니다." };
    }
  }

  return {
    ok: true,
    data: {
      slug: slug.trim(),
      eventType: eventType as AnalyticsEventType,
      productId: (productId as string | null | undefined) ?? null,
    },
  };
}
