import { PageHeader } from "@/components/admin/PageHeader";
import { Card, StatCard } from "@/components/admin/Card";
import { BarTrend } from "@/components/admin/BarTrend";
import { Select } from "@/components/admin/FormControls";
import { getLandingPages } from "@/lib/landing-pages";
import { getAnalyticsData, getKstDayRange } from "@/lib/analytics-admin";

type SearchParams = Promise<{
  range?: string;
  landingPageId?: string;
}>;

const RANGE_OPTIONS = [7, 30, 90] as const;
type RangeDays = (typeof RANGE_OPTIONS)[number];

function parseRange(value: string | undefined): RangeDays {
  const n = Number(value);
  return (RANGE_OPTIONS as readonly number[]).includes(n) ? (n as RangeDays) : 7;
}

/** consultations / pageViews * 100, safe against pageViews === 0 (NaN/Infinity). */
function conversionRateLabel(consultations: number, pageViews: number): string {
  if (pageViews === 0) return "-";
  return `${((consultations / pageViews) * 100).toFixed(1)}%`;
}

function formatShortDate(dateStr: string): string {
  return dateStr.slice(5).replace("-", "/");
}

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const range = parseRange(sp.range);
  const landingPageId = sp.landingPageId || undefined;

  const [landingPages, analytics] = await Promise.all([
    getLandingPages(),
    getAnalyticsData(getKstDayRange(range), landingPageId),
  ]);

  const { summary, dailyTrend, pagePerformance, productPerformance } = analytics;
  const conversionRate = conversionRateLabel(summary.consultations, summary.pageViews);

  const pageViewTrendData = dailyTrend.map((d) => ({ label: formatShortDate(d.date), value: d.pageViews }));
  const consultationTrendData = dailyTrend.map((d) => ({ label: formatShortDate(d.date), value: d.consultations }));
  const trendMinWidth = Math.max(dailyTrend.length * 40, 320);

  return (
    <div>
      <PageHeader title="통계" description="랜딩페이지 조회와 전환 성과를 확인하세요." />

      <Card className="mb-6">
        <form method="get" className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <Select name="range" defaultValue={String(range)}>
            <option value="7">최근 7일</option>
            <option value="30">최근 30일</option>
            <option value="90">최근 90일</option>
          </Select>
          <Select name="landingPageId" defaultValue={landingPageId ?? ""} className="sm:col-span-2">
            <option value="">전체 페이지</option>
            {landingPages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.businessName} (/{p.slug})
              </option>
            ))}
          </Select>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            적용
          </button>
        </form>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="페이지 조회수" value={summary.pageViews.toLocaleString()} tone="blue" />
        <StatCard label="전화 클릭" value={summary.phoneClicks.toLocaleString()} />
        <StatCard label="카카오 클릭" value={summary.kakaoClicks.toLocaleString()} />
        <StatCard label="견적 CTA 클릭" value={summary.quoteCtaClicks.toLocaleString()} />
        <StatCard label="상담 신청" value={summary.consultations.toLocaleString()} tone="green" />
        <StatCard label="상담 전환율" value={conversionRate} description="상담 / 조회수" tone="amber" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-base font-semibold text-slate-900">일별 조회수 추이</h2>
          <p className="mt-1 text-sm text-slate-500">선택한 기간의 페이지 조회수 (KST 기준)</p>
          <div className="mt-6 overflow-x-auto">
            <div style={{ minWidth: trendMinWidth }}>
              <BarTrend data={pageViewTrendData} />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-slate-900">일별 상담 신청 추이</h2>
          <p className="mt-1 text-sm text-slate-500">선택한 기간의 상담 신청 건수 (KST 기준)</p>
          <div className="mt-6 overflow-x-auto">
            <div style={{ minWidth: trendMinWidth }}>
              <BarTrend data={consultationTrendData} />
            </div>
          </div>
        </Card>
      </div>

      <Card padded={false} className="mt-6">
        <div className="px-6 pt-6">
          <h2 className="text-base font-semibold text-slate-900">페이지별 성과</h2>
          <p className="mt-1 text-sm text-slate-500">조회수가 높은 순서입니다.</p>
        </div>
        {pagePerformance.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">해당 기간에 수집된 데이터가 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="mt-4 w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-t border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                  <th className="px-6 py-3">업체명</th>
                  <th className="px-6 py-3">조회수</th>
                  <th className="px-6 py-3">전화</th>
                  <th className="px-6 py-3">카카오</th>
                  <th className="px-6 py-3">제품 CTA</th>
                  <th className="px-6 py-3">견적 CTA</th>
                  <th className="px-6 py-3">상담</th>
                  <th className="px-6 py-3">전환율</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagePerformance.map((row) => (
                  <tr key={row.landingPageId ?? "deleted"}>
                    <td className="px-6 py-3.5 font-medium text-slate-900">
                      {row.businessName ? (
                        <>
                          {row.businessName}
                          <span className="ml-1.5 font-mono text-xs font-normal text-slate-400">/{row.slug}</span>
                        </>
                      ) : (
                        <span className="text-slate-400">삭제된 페이지</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">{row.pageViews.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-slate-600">{row.phoneClicks.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-slate-600">{row.kakaoClicks.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-slate-600">{row.productCtaClicks.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-slate-600">{row.quoteCtaClicks.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-slate-600">{row.consultations.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {conversionRateLabel(row.consultations, row.pageViews)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="h-2" />
      </Card>

      <Card padded={false} className="mt-6">
        <div className="px-6 pt-6">
          <h2 className="text-base font-semibold text-slate-900">제품/서비스별 성과</h2>
          <p className="mt-1 text-sm text-slate-500">제품 CTA 클릭이 많은 순서입니다.</p>
        </div>
        {productPerformance.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">해당 기간에 수집된 데이터가 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="mt-4 w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-t border-slate-100 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                  <th className="px-6 py-3">제품/서비스명</th>
                  <th className="px-6 py-3">소속 페이지</th>
                  <th className="px-6 py-3">유형</th>
                  <th className="px-6 py-3">제품 CTA 클릭</th>
                  <th className="px-6 py-3">상담</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productPerformance.map((row) => (
                  <tr key={row.productId}>
                    <td className="px-6 py-3.5 font-medium text-slate-900">
                      {row.productName ?? <span className="text-slate-400">삭제된 제품/서비스</span>}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {row.businessName ?? <span className="text-slate-400">삭제된 페이지</span>}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {row.itemType === "service" ? "서비스" : row.itemType === "product" ? "제품" : "-"}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">{row.productCtaClicks.toLocaleString()}</td>
                    <td className="px-6 py-3.5 text-slate-600">{row.consultations.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="h-2" />
      </Card>
    </div>
  );
}
