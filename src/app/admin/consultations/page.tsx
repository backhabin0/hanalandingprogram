import { PageHeader } from "@/components/admin/PageHeader";
import { Card, StatCard } from "@/components/admin/Card";
import { ConsultationStatusBadge } from "@/components/admin/StatusBadge";
import { consultations } from "@/lib/mock-data";

export default function AdminConsultationsPage() {
  const newCount = consultations.filter((c) => c.status === "new").length;
  const contactedCount = consultations.filter((c) => c.status === "contacted").length;
  const closedCount = consultations.filter((c) => c.status === "closed").length;

  return (
    <div>
      <PageHeader
        title="상담 관리"
        description="공개된 랜딩페이지에서 접수된 상담 요청입니다. (mock 데이터)"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="신규" value={newCount} tone="blue" />
        <StatCard label="연락완료" value={contactedCount} tone="amber" />
        <StatCard label="종료" value={closedCount} />
      </div>

      <Card padded={false} className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3.5">고객명</th>
                <th className="px-6 py-3.5">연락처</th>
                <th className="px-6 py-3.5">업체</th>
                <th className="px-6 py-3.5">문의 내용</th>
                <th className="px-6 py-3.5">상태</th>
                <th className="px-6 py-3.5">접수일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {consultations.map((consultation) => (
                <tr key={consultation.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{consultation.customerName}</td>
                  <td className="px-6 py-4 text-slate-600">{consultation.phone}</td>
                  <td className="px-6 py-4 text-slate-600">{consultation.businessName}</td>
                  <td className="px-6 py-4 max-w-xs truncate text-slate-500">
                    {consultation.message ?? "-"}
                  </td>
                  <td className="px-6 py-4">
                    <ConsultationStatusBadge status={consultation.status} />
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(consultation.createdAt).toLocaleDateString("ko-KR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
