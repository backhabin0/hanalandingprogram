import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { listAllConsultationRequestsForExport } from "@/lib/consultation-admin";
import { CONSULTATION_STATUSES, CONSULTATION_STATUS_LABEL, INQUIRY_TYPES, INQUIRY_TYPE_LABEL, PREFERRED_CONTACT_LABEL } from "@/lib/consultation-requests";
import { toCsv } from "@/lib/csv";
import type { ConsultationStatus, InquiryType } from "@/types/landing";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const CSV_HEADER = [
  "접수일",
  "업체명",
  "slug",
  "문의유형",
  "제품/서비스",
  "이름",
  "전화번호",
  "이메일",
  "회사명",
  "선호연락방법",
  "문의내용",
  "상태",
];

export async function GET(request: NextRequest) {
  // Same access-control gate as every /admin/* page and mutating action —
  // a Route Handler is a public endpoint by default and is not covered by
  // the admin layout's requireUser() call, so it must check on its own.
  await requireUser();

  const sp = request.nextUrl.searchParams;
  const status = (CONSULTATION_STATUSES as string[]).includes(sp.get("status") ?? "")
    ? (sp.get("status") as ConsultationStatus)
    : undefined;
  const inquiryType = (INQUIRY_TYPES as string[]).includes(sp.get("inquiryType") ?? "")
    ? (sp.get("inquiryType") as InquiryType)
    : undefined;
  const landingPageId = sp.get("landingPageId") || undefined;
  const q = sp.get("q") || undefined;

  const items = await listAllConsultationRequestsForExport({ q, status, inquiryType, landingPageId });

  const rows = items.map((c) => [
    formatDateTime(c.createdAt),
    c.businessName ?? "삭제된 페이지",
    c.slug ?? "",
    INQUIRY_TYPE_LABEL[c.inquiryType],
    c.productId ? c.productName ?? "삭제된 제품/서비스" : "",
    c.name,
    // Kept as the original string — never parsed as a number, so a leading
    // "0" (010-...) survives untouched.
    c.phone,
    c.email ?? "",
    c.companyName ?? "",
    c.preferredContact ? PREFERRED_CONTACT_LABEL[c.preferredContact] : "",
    c.message ?? "",
    CONSULTATION_STATUS_LABEL[c.status],
  ]);

  const csv = toCsv([CSV_HEADER, ...rows]);
  // UTF-8 BOM so Excel on Windows (which guesses the legacy system codepage
  // without it) renders Hangul correctly instead of mojibake.
  const bom = "﻿";

  return new NextResponse(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="consultations-${Date.now()}.csv"`,
    },
  });
}
