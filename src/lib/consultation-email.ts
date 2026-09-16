import "server-only";

import { absoluteUrl } from "@/lib/seo/site-url";
import { INQUIRY_TYPE_LABEL, PREFERRED_CONTACT_LABEL } from "@/lib/consultation-requests";
import type { InquiryType, PreferredContact } from "@/types/landing";

/**
 * Stage 11 — best-effort admin notification email for a new consultation
 * request, sent via Resend's plain HTTP API (no `resend` package: this
 * project has zero non-Supabase/Next dependencies today, and a single
 * `fetch` call covers the one thing this app needs from Resend — send one
 * templated email — without adding a dependency for it).
 *
 * This function NEVER throws. A missing config, a network failure, a
 * non-2xx response from Resend — all are caught and logged (error class
 * only, never the customer's name/phone/email/message) and swallowed here.
 * The consultation row is already committed to the DB by the time this
 * runs; nothing about email delivery may ever affect that.
 */

export interface ConsultationNotificationParams {
  id: string;
  businessName: string;
  slug: string;
  inquiryType: InquiryType;
  productName: string | null;
  name: string;
  phone: string;
  email: string | null;
  companyName: string | null;
  message: string | null;
  preferredContact: PreferredContact | null;
  createdAt: Date;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * "2026-09-17 14:32" in Asia/Seoul, built from `formatToParts` rather than
 * post-processing `Intl.DateTimeFormat`'s locale-formatted string — that
 * string's exact punctuation (dots, spaces) is locale/runtime behavior, not
 * a stable contract to regex against.
 */
function formatKst(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
}

function subjectFor(params: ConsultationNotificationParams): string {
  const prefix = params.inquiryType === "quote" ? "견적 요청" : "상담 접수";
  return `[${prefix}] ${params.businessName} - ${params.name}`;
}

function buildRows(params: ConsultationNotificationParams, createdAtLabel: string): [string, string][] {
  return [
    ["업체명", params.businessName],
    ["페이지", `/${params.slug}`],
    ["문의 유형", INQUIRY_TYPE_LABEL[params.inquiryType]],
    ["제품/서비스", params.productName ?? "전체 상담"],
    ["이름", params.name],
    ["전화번호", params.phone],
    ["이메일", params.email ?? "-"],
    ["회사명", params.companyName ?? "-"],
    ["선호 연락 방법", params.preferredContact ? PREFERRED_CONTACT_LABEL[params.preferredContact] : "상관없음"],
    ["접수시간", createdAtLabel],
  ];
}

function buildHtml(params: ConsultationNotificationParams, rows: [string, string][], detailUrl: string): string {
  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 16px 4px 0;color:#64748b;white-space:nowrap;vertical-align:top;">${escapeHtml(
          label
        )}</td><td style="padding:4px 0;color:#0f172a;">${escapeHtml(value)}</td></tr>`
    )
    .join("");

  const messageHtml = params.message
    ? `<div style="margin-top:16px;"><p style="color:#64748b;margin:0 0 4px;font-size:13px;">문의 내용</p><p style="white-space:pre-line;color:#0f172a;margin:0;">${escapeHtml(
        params.message
      )}</p></div>`
    : "";

  return `<div style="font-family:-apple-system,Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
    <h2 style="color:#0f172a;font-size:18px;">새 문의가 접수되었습니다</h2>
    <table style="border-collapse:collapse;margin-top:12px;font-size:14px;">${rowsHtml}</table>
    ${messageHtml}
    <p style="margin-top:24px;"><a href="${escapeHtml(detailUrl)}" style="color:#2563eb;font-size:14px;">관리자에서 상세 보기 →</a></p>
  </div>`;
}

function buildText(params: ConsultationNotificationParams, rows: [string, string][], detailUrl: string): string {
  const lines = [
    "새 문의가 접수되었습니다.",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
  ];
  if (params.message) {
    lines.push("", "문의 내용:", params.message);
  }
  lines.push("", `관리자에서 상세 보기: ${detailUrl}`);
  return lines.join("\n");
}

export async function sendConsultationNotificationEmail(params: ConsultationNotificationParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONSULTATION_NOTIFICATION_EMAIL;
  const from = process.env.CONSULTATION_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    console.log("[consultation-email] notification skipped: configuration missing");
    return;
  }

  try {
    const createdAtLabel = formatKst(params.createdAt);
    const rows = buildRows(params, createdAtLabel);
    const detailUrl = absoluteUrl(`/admin/consultations/${params.id}`);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: subjectFor(params),
        html: buildHtml(params, rows, detailUrl),
        text: buildText(params, rows, detailUrl),
      }),
    });

    if (!res.ok) {
      console.error("[consultation-email] send failed: status", res.status);
    }
  } catch (err) {
    console.error("[consultation-email] unexpected error:", err instanceof Error ? err.message : "unknown");
  }
}
