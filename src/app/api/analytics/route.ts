import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicLandingPageContext } from "@/lib/public-landing-pages";
import { validateAnalyticsTrackRequest } from "@/lib/analytics-events";

/**
 * Stage 12 — the only way `landing_page_events` gets written. The public
 * browser never calls Supabase JS directly for this; every ping goes
 * through here so `landing_page_id` is always server-resolved from a
 * re-verified public slug, never trusted from the client (same model as
 * `createConsultationRequestAction`, Stage 11).
 *
 * Validation order matches the Stage 12 spec exactly:
 *   1-2. JSON body parsing + slug type/length (in `validateAnalyticsTrackRequest`)
 *   3-4. eventType allowlist + productId UUID shape (also in the validator above)
 *   5-6. public landing page lookup -> real landing_page_id
 *   7-8. product ownership + is_active (both already enforced by
 *        `getPublicLandingPageContext`'s `products` list, which is built
 *        from `getPublicProducts` — active-products-of-this-page only)
 *   9.   DB insert, RLS as the second line of defense
 *
 * Never returns a raw Supabase/Postgres error, SQL, or stack trace to the
 * client — every failure path is a short, fixed Korean message.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const validated = validateAnalyticsTrackRequest(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const page = await getPublicLandingPageContext(validated.data.slug);
  if (!page) {
    // Slug doesn't exist, or the page isn't currently public — never
    // confirm/deny which, same as the consultation action.
    return NextResponse.json({ error: "페이지를 찾을 수 없습니다." }, { status: 404 });
  }

  const { productId, eventType } = validated.data;
  if (productId !== null && !page.products.some((p) => p.id === productId)) {
    // Different page's product, inactive product, or nonexistent — all
    // rejected the same way; never silently drop to a page-only event.
    return NextResponse.json({ error: "잘못된 제품 정보입니다." }, { status: 400 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("landing_page_events").insert({
      landing_page_id: page.id,
      product_id: productId,
      event_type: eventType,
    });

    if (error) {
      // Never log the request body beyond what's already safe here (no PII
      // in this table at all) — just enough to diagnose the failure class.
      console.error("[analytics] insert failed:", error.code);
      return NextResponse.json({ error: "기록 중 문제가 발생했습니다." }, { status: 500 });
    }
  } catch (err) {
    console.error("[analytics] unexpected error:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ error: "기록 중 문제가 발생했습니다." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
