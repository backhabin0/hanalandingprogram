import { PageHeader } from "@/components/admin/PageHeader";
import { Card, StatCard } from "@/components/admin/Card";
import { BarTrend } from "@/components/admin/BarTrend";
import { dashboardStats, pageViewsTrend, topPerformingPages } from "@/lib/mock-data";

export default function AdminAnalyticsPage() {
  const totalViews = pageViewsTrend.reduce((sum, d) => sum + d.value, 0);
  const conversionRate = ((dashboardStats.consultations / totalViews) * 100).toFixed(1);

  return (
    <div>
      <PageHeader
        title="통계"
        description="랜딩페이지 성과를 확인하세요. Analytics 연동 전까지는 mock 데이터로 표시됩니다."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="최근 7일 조회수" value={totalViews.toLocaleString()} description="전체 공개 페이지 합산" tone="blue" />
        <StatCard label="상담 전환율" value={`${conversionRate}%`} description="조회 대비 상담 신청 비율" tone="green" />
        <StatCard label="공개 페이지" value={dashboardStats.public} description="현재 서비스 중" />
      </div>

      <Card className="mt-6">
        <h2 className="text-base font-semibold text-slate-900">최근 7일 방문 추이</h2>
        <p className="mt-1 text-sm text-slate-500">전체 공개 페이지 합산 조회수 (mock)</p>
        <div className="mt-6">
          <BarTrend data={pageViewsTrend} />
        </div>
      </Card>

      <Card padded={false} className="mt-6">
        <div className="px-6 pt-6">
          <h2 className="text-base font-semibold text-slate-900">페이지별 성과</h2>
          <p className="mt-1 text-sm text-slate-500">조회수와 상담 전환이 높은 순서입니다.</p>
        </div>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-t border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
              <th className="px-6 py-3">업체명</th>
              <th className="px-6 py-3">URL</th>
              <th className="px-6 py-3">조회수</th>
              <th className="px-6 py-3">상담 신청</th>
              <th className="px-6 py-3">전환율</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {topPerformingPages.map((page) => (
              <tr key={page.slug}>
                <td className="px-6 py-3.5 font-medium text-slate-900">{page.businessName}</td>
                <td className="px-6 py-3.5 font-mono text-xs text-slate-500">/{page.slug}</td>
                <td className="px-6 py-3.5 text-slate-600">{page.views.toLocaleString()}</td>
                <td className="px-6 py-3.5 text-slate-600">{page.consultations}</td>
                <td className="px-6 py-3.5 text-slate-600">
                  {((page.consultations / page.views) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="h-2" />
      </Card>
    </div>
  );
}
