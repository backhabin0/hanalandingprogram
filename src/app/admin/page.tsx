import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, StatCard } from "@/components/admin/Card";
import { PageStatusBadge, ConsultationStatusBadge } from "@/components/admin/StatusBadge";
import { getTemplateMeta } from "@/lib/mock-data";
import { getLandingPages } from "@/lib/landing-pages";
import { getConsultationStatusCounts, getRecentConsultationRequests } from "@/lib/consultation-admin";
import { INQUIRY_TYPE_LABEL } from "@/lib/consultation-requests";

export default async function AdminDashboardPage() {
  const [landingPages, consultationCounts, recentConsultations] = await Promise.all([
    getLandingPages(),
    getConsultationStatusCounts(),
    getRecentConsultationRequests(5),
  ]);
  const publicCount = landingPages.filter((p) => p.status === "public").length;
  const privateCount = landingPages.filter((p) => p.status === "private").length;
  const recentPages = [...landingPages].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)).slice(0, 5);

  return (
    <div>
      <PageHeader
        title="대시보드"
        description="전체 랜딩페이지 현황을 한눈에 확인하세요."
        actions={
          <Link
            href="/admin/pages/new"
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            + 새 페이지 만들기
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="전체 랜딩페이지" value={landingPages.length} description="누적 생성 페이지 수" />
        <StatCard label="공개" value={publicCount} description="현재 서비스 중인 페이지" tone="green" />
        <StatCard label="비공개" value={privateCount} description="초안 페이지" tone="amber" />
        <StatCard label="전체 상담" value={consultationCounts.total} description="누적 상담 접수 건수" tone="blue" />
        <StatCard label="신규 상담" value={consultationCounts.new} description="아직 연락하지 않은 건수" tone="blue" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-900">최근 7일 방문 추이</h2>
          <p className="mt-1 text-sm text-slate-500">Analytics 연동 예정</p>
          <div className="flex h-40 items-center justify-center text-sm text-slate-400">준비 중입니다.</div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-slate-900">인기 페이지</h2>
          <p className="mt-1 text-sm text-slate-500">Analytics 연동 예정</p>
          <div className="flex h-40 items-center justify-center text-sm text-slate-400">준비 중입니다.</div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" padded={false}>
          <div className="flex items-center justify-between px-6 pt-6">
            <h2 className="text-base font-semibold text-slate-900">최근 랜딩페이지</h2>
            <Link href="/admin/pages" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              전체 보기 →
            </Link>
          </div>
          {recentPages.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              아직 생성된 랜딩페이지가 없습니다.
            </div>
          ) : (
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="border-t border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                  <th className="px-6 py-3">업체명</th>
                  <th className="px-6 py-3">템플릿</th>
                  <th className="px-6 py-3">상태</th>
                  <th className="px-6 py-3">수정일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPages.map((page) => (
                  <tr key={page.id}>
                    <td className="px-6 py-3">
                      <p className="font-medium text-slate-900">{page.businessName}</p>
                      <p className="text-xs text-slate-400">/{page.slug}</p>
                    </td>
                    <td className="px-6 py-3 text-slate-600">{getTemplateMeta(page.template)?.name ?? page.template}</td>
                    <td className="px-6 py-3">
                      <PageStatusBadge status={page.status} />
                    </td>
                    <td className="px-6 py-3 text-slate-500">
                      {new Date(page.updatedAt).toLocaleDateString("ko-KR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="h-2" />
        </Card>

        <Card padded={false}>
          <div className="flex items-center justify-between px-6 pt-6">
            <h2 className="text-base font-semibold text-slate-900">최근 상담</h2>
            <Link href="/admin/consultations" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              전체 보기 →
            </Link>
          </div>
          {recentConsultations.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">아직 접수된 상담이 없습니다.</div>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {recentConsultations.map((c) => (
                <li key={c.id} className="px-6 py-3">
                  <Link href={`/admin/consultations/${c.id}`} className="block hover:bg-slate-50">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-slate-900">{c.name}</p>
                      <ConsultationStatusBadge status={c.status} />
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {INQUIRY_TYPE_LABEL[c.inquiryType]} · {c.businessName ?? "삭제된 페이지"}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="h-2" />
        </Card>
      </div>
    </div>
  );
}
