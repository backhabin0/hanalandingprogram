"use server";

import { randomUUID } from "crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicLandingPageForConsultation } from "@/lib/public-landing-pages";
import {
  validateConsultationSubmission,
  type ConsultationSubmissionInput,
} from "@/lib/consultation-requests";
import { sendConsultationNotificationEmail } from "@/lib/consultation-email";

/**
 * Public consultation/quote submission for `/[slug]` — called directly by
 * `ConsultationForm` (a plain async call, not a `<form action>`; see that
 * component for why). No `requireUser()` here: this is invoked by anonymous
 * site visitors, not admins. Every guarantee an admin action would get from
 * `requireUser()` + RLS's "authenticated is admin" model, this one gets from:
 *
 *   1. honeypot check
 *   2. field-shape validation (`validateConsultationSubmission`)
 *   3. re-resolving `slug` -> a currently-public page's real id (the client
 *      never gets to hand us a `landing_page_id` directly)
 *   4. product ownership check against that same page
 *   5. the INSERT itself, still covered by RLS as a second line of defense
 *      (a bug here doesn't bypass the DB-level check)
 *
 * Stage 11 flow: validate -> re-verify page/product -> INSERT -> (only if
 * the INSERT actually succeeded) attempt the admin notification email ->
 * respond to the customer. The email attempt can never fail the DB save —
 * `sendConsultationNotificationEmail` swallows every error itself — and a
 * duplicate submission_id (already-saved retry) sends no second email.
 */

export interface ConsultationSubmitResult {
  ok: boolean;
  error?: string;
}

export async function createConsultationRequestAction(
  input: ConsultationSubmissionInput
): Promise<ConsultationSubmitResult> {
  // Honeypot: a real visitor never sees or fills this field. A bot that
  // fills every input it finds does. Report success without touching the
  // DB — telling a bot "rejected" only teaches it to try again differently.
  if (input.honeypot.trim() !== "") {
    return { ok: true };
  }

  const validated = validateConsultationSubmission(input);
  if (!validated.ok) {
    return { ok: false, error: validated.error };
  }

  const page = await getPublicLandingPageForConsultation(input.slug);
  if (!page) {
    // Slug doesn't exist, or the page isn't public (includes the case where
    // someone calls this action directly against a private/deleted slug,
    // bypassing the normal /[slug] 404). Same generic message either way —
    // never confirm/deny slug existence to the caller.
    return { ok: false, error: "상담 신청 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요." };
  }

  const selectedProduct = input.productId ? page.products.find((p) => p.id === input.productId) : null;
  if (input.productId !== null && !selectedProduct) {
    // Either a different page's product id, an inactive product, or one
    // that never existed — all treated the same: reject, don't silently
    // drop to landing_page-only.
    return { ok: false, error: "선택하신 제품/서비스를 확인할 수 없습니다. 다시 선택해주세요." };
  }

  const supabase = await createSupabaseServerClient();

  // Generated here (not left to the column's `default gen_random_uuid()`)
  // so the id is known without ever needing `.select()` after insert — anon
  // still has no SELECT grant on this table (see 006 migration), so this is
  // the only way to get an id for the email's admin-detail link.
  const id = randomUUID();
  const createdAt = new Date();

  const { error } = await supabase.from("consultation_requests").insert({
    id,
    landing_page_id: page.id,
    product_id: input.productId,
    inquiry_type: input.inquiryType,
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email.trim() || null,
    company_name: input.companyName.trim() || null,
    message: input.message.trim() || null,
    preferred_contact: input.preferredContact,
    privacy_consent: input.privacyConsent,
    submission_id: input.submissionId,
  });

  if (error) {
    if (error.code === "23505") {
      // Same submission_id already stored — a retried/duplicated request,
      // not a new one. The customer already succeeded once (and already got
      // one notification email then); tell them so, and send no email now.
      return { ok: true };
    }
    // Never log name/phone/email/message here — only enough to diagnose
    // the failure class server-side.
    console.error("[createConsultationRequestAction] insert failed:", error.code);
    return { ok: false, error: "상담 신청 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요." };
  }

  await sendConsultationNotificationEmail({
    id,
    businessName: page.businessName,
    slug: input.slug,
    inquiryType: input.inquiryType,
    productName: selectedProduct?.name ?? null,
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email.trim() || null,
    companyName: input.companyName.trim() || null,
    message: input.message.trim() || null,
    preferredContact: input.preferredContact,
    createdAt,
  });

  return { ok: true };
}
