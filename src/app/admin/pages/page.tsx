import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/admin/Card";
import { PageStatusBadge } from "@/components/admin/StatusBadge";
import { getTemplateMeta, landingPages } from "@/lib/mock-data";

export default function AdminPagesListPage() {
  return (
    <div>
      <PageHeader
        title="랜딩페이지 관리"
        description={`전체 ${landingPages.length}개의 랜딩페이지 (mock 데이터)`}
        actions={
          <Link
            href="/admin/pages/new"
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            + 새 페이지 만들기
          </Link>
        }
      />

      <Card padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3.5">업체명</th>
                <th className="px-6 py-3.5">URL</th>
                <th className="px-6 py-3.5">템플릿</th>
                <th className="px-6 py-3.5">상태</th>
                <th className="px-6 py-3.5">작성일</th>
                <th className="px-6 py-3.5 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {landingPages.map((page) => {
                const template = getTemplateMeta(page.template);
                return (
                  <tr key={page.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{page.businessName}</p>
                      <p className="text-xs text-slate-400">{page.title}</p>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">/{page.slug}</td>
                    <td className="px-6 py-4 text-slate-600">{template?.name ?? page.template}</td>
                    <td className="px-6 py-4">
                      <PageStatusBadge status={page.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(page.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          className="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                        >
                          수정
                        </button>
                        <Link
                          href={`/preview/${page.template}`}
                          target="_blank"
                          className="rounded-md px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                        >
                          미리보기
                        </Link>
                        <button
                          type="button"
                          className="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                        >
                          복제
                        </button>
                        <button
                          type="button"
                          className="rounded-md px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="mt-4 text-xs text-slate-400">
        ※ 수정 / 복제 / 삭제 버튼은 UI 프로토타입이며, 실제 동작은 2단계(DB 연동)에서 구현됩니다.
      </p>
    </div>
  );
}
