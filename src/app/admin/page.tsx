import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, StatCard } from "@/components/admin/Card";
import { BarTrend } from "@/components/admin/BarTrend";
import { PageStatusBadge, ConsultationStatusBadge } from "@/components/admin/StatusBadge";
import {
  consultations,
  dashboardStats,
  landingPages,
  pageViewsTrend,
  topPerformingPages,
} from "@/lib/mock-data";

export default function AdminDashboardPage() {
  const recentPages = [...landingPages]
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, 5);
  const newConsultations = consultations.filter((c) => c.status === "new").slice(0, 4);

  return (
    <div>
      <PageHeader
        title="대시보드"
        description="전체 랜딩페이지 현황과 최근 상담 요청을 한눈에 확인하세요. (mock 데이터)"
        actions={
          <Link
            href="/admin/pages/new"
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            + 새 페이지 만들기
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="전체 랜딩페이지" value={dashboardStats.totalPages} description="누적 생성 페이지 수" />
        <StatCard
          label="공개"
          value={dashboardStats.public}
          description="현재 서비스 중인 페이지"
          tone="green"
        />
        <StatCard
          label="비공개"
          value={dashboardStats.private}
          description="초안 페이지"
          tone="amber"
        />
        <StatCard
          label="상담"
          value={dashboardStats.consultations}
          description={`신규 ${dashboardStats.newConsultations}건`}
          tone="blue"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">최근 7일 방문 추이</h2>
              <p className="mt-1 text-sm text-slate-500">전체 공개 페이지 합산 조회수 (mock)</p>
            </div>
          </div>
          <BarTrend data={pageViewsTrend} />
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-slate-900">인기 페이지</h2>
          <p className="mt-1 text-sm text-slate-500">조회수 상위 페이지</p>
          <ul className="mt-5 space-y-4">
            {topPerformingPages.map((page, index) => (
              <li key={page.slug} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{page.businessName}</p>
                  <p className="text-xs text-slate-400">/{page.slug}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{page.views.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">상담 {page.consultations}건</p>
                </div>
              </li>
            ))}
          </ul>
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
                  <td className="px-6 py-3 text-slate-600">{page.template}</td>
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
          <div className="h-2" />
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">신규 상담</h2>
            <Link href="/admin/consultations" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              전체 보기 →
            </Link>
          </div>
          <ul className="mt-4 space-y-4">
            {newConsultations.map((consultation) => (
              <li key={consultation.id} className="border-t border-slate-100 pt-4 first:border-0 first:pt-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-900">{consultation.customerName}</p>
                  <ConsultationStatusBadge status={consultation.status} />
                </div>
                <p className="mt-1 text-xs text-slate-400">{consultation.businessName}</p>
                {consultation.message && (
                  <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">{consultation.message}</p>
                )}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
