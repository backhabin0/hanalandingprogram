import type { ConsultationRequest, ConsultationStatus, InquiryType, PreferredContact } from "@/types/landing";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Stage 10 — consultation/quote submissions from public `/[slug]` pages.
 * Shared by `src/app/[slug]/actions.ts` (validation + row mapping for the
 * insert) now, and by Stage 11's admin list/detail views later.
 */

type ConsultationRequestRow = Database["public"]["Tables"]["consultation_requests"]["Row"];

export const INQUIRY_TYPES: InquiryType[] = ["consultation", "quote", "product", "service", "other"];

export const INQUIRY_TYPE_LABEL: Record<InquiryType, string> = {
  consultation: "상담 문의",
  quote: "견적 요청",
  product: "제품 문의",
  service: "서비스 문의",
  other: "기타 문의",
};

export const PREFERRED_CONTACTS: PreferredContact[] = ["phone", "kakao", "email"];

export const PREFERRED_CONTACT_LABEL: Record<PreferredContact, string> = {
  phone: "전화",
  kakao: "카카오톡",
  email: "이메일",
};

export const CONSULTATION_STATUSES: ConsultationStatus[] = ["new", "contacted", "completed", "cancelled"];

export const CONSULTATION_STATUS_LABEL: Record<ConsultationStatus, string> = {
  new: "신규",
  contacted: "연락함",
  completed: "완료",
  cancelled: "취소",
};

export const CONSULTATION_FIELD_LIMITS = {
  name: 50,
  phoneDigitsMin: 9,
  phoneDigitsMax: 11,
  email: 254,
  companyName: 100,
  message: 2000,
} as const;

export function mapConsultationRequestRow(row: ConsultationRequestRow): ConsultationRequest {
  return {
    id: row.id,
    landingPageId: row.landing_page_id,
    productId: row.product_id,
    inquiryType: (INQUIRY_TYPES as string[]).includes(row.inquiry_type) ? (row.inquiry_type as InquiryType) : "other",
    name: row.name,
    phone: row.phone,
    email: row.email ?? undefined,
    companyName: row.company_name ?? undefined,
    message: row.message ?? undefined,
    preferredContact: (PREFERRED_CONTACTS as string[]).includes(row.preferred_contact ?? "")
      ? (row.preferred_contact as PreferredContact)
      : undefined,
    privacyConsent: row.privacy_consent,
    status: (CONSULTATION_STATUSES as string[]).includes(row.status) ? (row.status as ConsultationStatus) : "new",
    submissionId: row.submission_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(value: string): boolean {
  return UUID_RE.test(value);
}

// Deliberately permissive (no "must start with 01x" Korean-mobile shape) —
// this service isn't Korea-only, so only a plausible overall digit count is
// enforced, per the Stage 10 spec.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return value.length <= CONSULTATION_FIELD_LIMITS.email && EMAIL_RE.test(value);
}

export function isPlausiblePhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= CONSULTATION_FIELD_LIMITS.phoneDigitsMin && digits.length <= CONSULTATION_FIELD_LIMITS.phoneDigitsMax;
}

/** Raw payload as submitted by `ConsultationForm`, before server-side validation. */
export interface ConsultationSubmissionInput {
  slug: string;
  productId: string | null;
  inquiryType: InquiryType;
  name: string;
  phone: string;
  email: string;
  companyName: string;
  message: string;
  preferredContact: PreferredContact | null;
  privacyConsent: boolean;
  submissionId: string;
  /** Honeypot field value — non-empty means a bot filled in a field real users never see. */
  honeypot: string;
}

/**
 * Field-shape/length/allowlist validation only — this can't confirm the
 * page is public or that `productId` actually belongs to it, since both
 * require a DB round trip. The Server Action does those checks separately
 * (see `src/app/[slug]/actions.ts`) after this passes.
 */
export function validateConsultationSubmission(
  input: ConsultationSubmissionInput
): { ok: true } | { ok: false; error: string } {
  if (!input.slug.trim()) return { ok: false, error: "잘못된 요청입니다." };
  if (!isValidUuid(input.submissionId)) return { ok: false, error: "잘못된 요청입니다." };

  if (!(INQUIRY_TYPES as string[]).includes(input.inquiryType)) {
    return { ok: false, error: "문의 유형을 선택해주세요." };
  }
  if (input.preferredContact !== null && !(PREFERRED_CONTACTS as string[]).includes(input.preferredContact)) {
    return { ok: false, error: "선호 연락 방법을 다시 선택해주세요." };
  }

  const name = input.name.trim();
  if (name.length < 1 || name.length > CONSULTATION_FIELD_LIMITS.name) {
    return { ok: false, error: `이름은 1~${CONSULTATION_FIELD_LIMITS.name}자로 입력해주세요.` };
  }

  if (!isPlausiblePhone(input.phone)) {
    return { ok: false, error: "연락처를 올바르게 입력해주세요." };
  }

  const email = input.email.trim();
  if (email && !isValidEmail(email)) {
    return { ok: false, error: "이메일 형식을 확인해주세요." };
  }

  const companyName = input.companyName.trim();
  if (companyName.length > CONSULTATION_FIELD_LIMITS.companyName) {
    return { ok: false, error: `회사명은 ${CONSULTATION_FIELD_LIMITS.companyName}자 이하로 입력해주세요.` };
  }

  const message = input.message.trim();
  if (message.length > CONSULTATION_FIELD_LIMITS.message) {
    return { ok: false, error: `문의 내용은 ${CONSULTATION_FIELD_LIMITS.message}자 이하로 입력해주세요.` };
  }

  if (input.productId !== null && !isValidUuid(input.productId)) {
    return { ok: false, error: "잘못된 제품 정보입니다." };
  }

  if (!input.privacyConsent) {
    return { ok: false, error: "개인정보 수집·이용에 동의해주세요." };
  }

  return { ok: true };
}
