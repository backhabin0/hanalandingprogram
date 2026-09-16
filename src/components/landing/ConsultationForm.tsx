"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { LandingVariant } from "./SiteHeader";
import type { LandingProduct } from "@/types/landing";
import type { InquiryType, PreferredContact } from "@/types/landing";
import { createConsultationRequestAction } from "@/app/[slug]/actions";
import { INQUIRY_TYPE_LABEL, INQUIRY_TYPES, PREFERRED_CONTACT_LABEL, PREFERRED_CONTACTS } from "@/lib/consultation-requests";

/**
 * The real, DB-backed consultation/quote form (Stage 10) — what `LeadSection`
 * renders in place of the old static preview `<form>`.
 *
 * Deliberately NOT `<form action={formAction}>` + `useActionState`: this
 * project already hit a documented bug class where a `<form action>`'s
 * native `form.reset()` after the action settles leaves a *controlled*
 * checkbox/select visually stale (see LandingPageForm/ProductsEditor/
 * SeoEditor's `syncTick` remount workaround, and GalleryEditor's own comment
 * on why it avoids `<form>` entirely). A public marketing form is exactly
 * the wrong place to risk that — every field here is plain controlled React
 * state, submission is a direct async call from `onSubmit`, and "reset after
 * success" means setting that state back to empty ourselves. No native
 * reset ever runs, so there's nothing to go stale.
 */

const VARIANT_CTA: Record<LandingVariant, string> = {
  a: "bg-slate-900 text-white hover:bg-slate-800",
  b: "bg-amber-400 text-slate-950 hover:bg-amber-300",
  c: "bg-orange-600 text-white hover:bg-orange-700",
};

const fieldClass =
  "block w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-offset-1";

function labelFor(product: LandingProduct): string {
  return `${product.itemType === "service" ? "[서비스]" : "[제품]"} ${product.name}`;
}

export function ConsultationForm({
  slug,
  products,
  variant,
  defaultInquiryType = "consultation",
}: {
  slug: string;
  products: LandingProduct[];
  variant: LandingVariant;
  defaultInquiryType?: InquiryType;
}) {
  const formId = "consultation-form";

  const [inquiryType, setInquiryType] = useState<InquiryType>(defaultInquiryType);
  const [productId, setProductId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [message, setMessage] = useState("");
  const [preferredContact, setPreferredContact] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [submissionId, setSubmissionId] = useState(() => crypto.randomUUID());

  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;

    setPending(true);
    setResult(null);

    const response = await createConsultationRequestAction({
      slug,
      productId: productId || null,
      inquiryType,
      name,
      phone,
      email,
      companyName,
      message,
      preferredContact: (preferredContact || null) as PreferredContact | null,
      privacyConsent,
      submissionId,
      honeypot,
    });

    setPending(false);

    if (!response.ok) {
      setResult({ type: "error", message: response.error ?? "상담 신청 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요." });
      return;
    }

    setResult({ type: "success", message: "상담 신청이 접수되었습니다.\n확인 후 연락드리겠습니다." });
    setInquiryType(defaultInquiryType);
    setProductId("");
    setName("");
    setPhone("");
    setEmail("");
    setCompanyName("");
    setMessage("");
    setPreferredContact("");
    setPrivacyConsent(false);
    setHoneypot("");
    // A fresh id for the next submission — reusing the old one after success
    // would make a genuinely new inquiry look like a duplicate retry.
    setSubmissionId(crypto.randomUUID());
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-xl bg-white p-7 shadow-xl sm:p-8">
      <h3 className="text-base font-semibold text-slate-900">빠른 상담 신청</h3>
      <p className="mt-1 text-sm text-slate-500">담당자가 확인 후 순차적으로 연락드립니다.</p>

      <div className="mt-6 space-y-4">
        {/* Honeypot — real visitors never see or reach this field (off-screen,
            aria-hidden, unfocusable), but a naive bot filling every input it
            finds in the DOM will. A filled value means "bot" — see the
            Server Action. */}
        <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
          <label htmlFor={`${formId}-website`}>웹사이트</label>
          <input
            id={`${formId}-website`}
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor={`${formId}-inquiry-type`}>
            문의 유형
          </label>
          <select
            id={`${formId}-inquiry-type`}
            value={inquiryType}
            onChange={(e) => setInquiryType(e.target.value as InquiryType)}
            className={fieldClass}
          >
            {INQUIRY_TYPES.map((type) => (
              <option key={type} value={type}>
                {INQUIRY_TYPE_LABEL[type]}
              </option>
            ))}
          </select>
        </div>

        {products.length > 0 && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor={`${formId}-product`}>
              문의할 제품/서비스
            </label>
            <select
              id={`${formId}-product`}
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className={fieldClass}
            >
              <option value="">전체 상담</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {labelFor(product)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor={`${formId}-name`}>
            이름
          </label>
          <input
            id={`${formId}-name`}
            type="text"
            required
            maxLength={50}
            placeholder="홍길동"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor={`${formId}-phone`}>
            연락처
          </label>
          <input
            id={`${formId}-phone`}
            type="tel"
            required
            placeholder="010-0000-0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor={`${formId}-email`}>
            이메일 <span className="font-normal text-slate-400">(선택)</span>
          </label>
          <input
            id={`${formId}-email`}
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor={`${formId}-company`}>
            회사명 <span className="font-normal text-slate-400">(선택)</span>
          </label>
          <input
            id={`${formId}-company`}
            type="text"
            maxLength={100}
            placeholder="회사명을 입력해주세요"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor={`${formId}-message`}>
            문의 내용 <span className="font-normal text-slate-400">(선택)</span>
          </label>
          <textarea
            id={`${formId}-message`}
            rows={3}
            maxLength={2000}
            placeholder="문의하실 내용을 간단히 남겨주세요."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={cn(fieldClass, "resize-none")}
          />
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            선호 연락 방법 <span className="font-normal text-slate-400">(선택)</span>
          </span>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-1.5 text-sm text-slate-600">
              <input
                type="radio"
                name={`${formId}-preferred-contact`}
                checked={preferredContact === ""}
                onChange={() => setPreferredContact("")}
                className="h-3.5 w-3.5"
              />
              상관없음
            </label>
            {PREFERRED_CONTACTS.map((option) => (
              <label key={option} className="flex items-center gap-1.5 text-sm text-slate-600">
                <input
                  type="radio"
                  name={`${formId}-preferred-contact`}
                  checked={preferredContact === option}
                  onChange={() => setPreferredContact(option)}
                  className="h-3.5 w-3.5"
                />
                {PREFERRED_CONTACT_LABEL[option]}
              </label>
            ))}
          </div>
        </div>

        <label className="flex items-start gap-2 text-xs leading-relaxed text-slate-600">
          <input
            type="checkbox"
            required
            checked={privacyConsent}
            onChange={(e) => setPrivacyConsent(e.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-slate-300"
          />
          <span>
            상담 접수를 위해 이름, 연락처, 문의내용을 수집·이용하는 것에 동의합니다.
            <span className="text-rose-500"> (필수)</span>
          </span>
        </label>

        <button
          type="submit"
          disabled={pending}
          className={cn(
            "w-full rounded-lg px-4 py-3 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60",
            VARIANT_CTA[variant]
          )}
        >
          {pending ? "접수 중..." : "상담 신청하기"}
        </button>

        {result && (
          <p
            role={result.type === "error" ? "alert" : "status"}
            className={cn(
              "whitespace-pre-line text-center text-sm",
              result.type === "success" ? "text-emerald-600" : "text-rose-600"
            )}
          >
            {result.message}
          </p>
        )}
      </div>
    </form>
  );
}
