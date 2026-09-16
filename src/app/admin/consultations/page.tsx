import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, StatCard } from "@/components/admin/Card";
import { Input, Select } from "@/components/admin/FormControls";
import { getLandingPages } from "@/lib/landing-pages";
import { listConsultationRequests, getConsultationStatusCounts } from "@/lib/consultation-admin";
import { CONSULTATION_STATUSES, CONSULTATION_STATUS_LABEL, INQUIRY_TYPES, INQUIRY_TYPE_LABEL } from "@/lib/consultation-requests";
import type { ConsultationStatus, InquiryType } from "@/types/landing";
import { StatusSelect } from "./StatusSelect";
import { Pagination } from "./Pagination";

type SearchParams = Promise<{
  q?: string;
  status?: string;
  inquiryType?: string;
  landingPageId?: string;
  page?: string;
}>;

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

export default async function AdminConsultationsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  const status = (CONSULTATION_STATUSES as string[]).includes(sp.status ?? "") ? (sp.status as ConsultationStatus) : undefined;
  const inquiryType = (INQUIRY_TYPES as string[]).includes(sp.inquiryType ?? "") ? (sp.inquiryType as InquiryType) : undefined;
  const landingPageId = sp.landingPageId || undefined;
  const q = sp.q || undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const [landingPages, counts, { items, total, pageSize }] = await Promise.all([
    getLandingPages(),
    getConsultationStatusCounts(),
    listConsultationRequests({ q, status, inquiryType, landingPageId }, page),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const filterParams = { q, status, inquiryType, landingPageId };
  const exportQuery = new URLSearchParams();
  for (const [key, value] of Object.entries(filterParams)) {
    if (value) exportQuery.set(key, value);
  }

  return (
    <div>
      <PageHeader
        title="상담 관리"
        description={`전체 ${total}건의 상담 요청`}
        actions={
          <a
            href={`/admin/consultations/export?${exportQuery.toString()}`}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            CSV 다운로드
          </a>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="전체" value={counts.total} />
        <StatCard label={CONSULTATION_STATUS_LABEL.new} value={counts.new} tone="blue" />
        <StatCard label={CONSULTATION_STATUS_LABEL.contacted} value={counts.contacted} tone="amber" />
        <StatCard label={CONSULTATION_STATUS_LABEL.completed} value={counts.completed} tone="green" />
        <StatCard label={CONSULTATION_STATUS_LABEL.cancelled} value={counts.cancelled} />
      </div>

      <Card className="mt-6">
        <form method="get" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Input type="search" name="q" placeholder="이름 / 전화번호 / 회사명 검색" defaultValue={q} className="lg:col-span-2" />
          <Select name="status" defaultValue={status ?? ""}>
            <option value="">전체 상태</option>
            {CONSULTATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {CONSULTATION_STATUS_LABEL[s]}
              </option>
            ))}
          </Select>
          <Select name="inquiryType" defaultValue={inquiryType ?? ""}>
            <option value="">전체 문의 유형</option>
            {INQUIRY_TYPES.map((t) => (
              <option key={t} value={t}>
                {INQUIRY_TYPE_LABEL[t]}
              </option>
            ))}
          </Select>
          <Select name="landingPageId" defaultValue={landingPageId ?? ""}>
            <option value="">전체 페이지</option>
            {landingPages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.businessName} (/{p.slug})
              </option>
            ))}
          </Select>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:col-span-2 lg:col-span-1"
          >
            검색
          </button>
        </form>
      </Card>

      <Card padded={false} className="mt-6">
        {items.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-slate-500">조건에 맞는 상담 요청이 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                  <th className="px-6 py-3.5">접수일</th>
                  <th className="px-6 py-3.5">업체명 / slug</th>
                  <th className="px-6 py-3.5">문의 유형</th>
                  <th className="px-6 py-3.5">제품/서비스</th>
                  <th className="px-6 py-3.5">이름</th>
                  <th className="px-6 py-3.5">전화번호</th>
                  <th className="px-6 py-3.5">회사명</th>
                  <th className="px-6 py-3.5">문의내용</th>
                  <th className="px-6 py-3.5">상태</th>
                  <th className="px-6 py-3.5 text-right">상세</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">{formatDateTime(c.createdAt)}</td>
                    <td className="px-6 py-4">
                      {c.businessName ? (
                        <>
                          <p className="font-medium text-slate-900">{c.businessName}</p>
                          <p className="text-xs text-slate-400">/{c.slug}</p>
                        </>
                      ) : (
                        <span className="text-slate-400">삭제된 페이지</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{INQUIRY_TYPE_LABEL[c.inquiryType]}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {c.productId ? c.productName ?? "삭제된 제품/서비스" : "전체 상담"}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{c.name}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <a href={`tel:${c.phone}`} className="hover:underline">
                        {c.phone}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{c.companyName ?? "-"}</td>
                    <td className="px-6 py-4 max-w-[200px] truncate text-slate-500">{c.message ?? "-"}</td>
                    <td className="px-6 py-4">
                      <StatusSelect id={c.id} status={c.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/consultations/${c.id}`}
                        className="rounded-md px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                      >
                        상세보기
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} params={filterParams} />
      </Card>
    </div>
  );
}
