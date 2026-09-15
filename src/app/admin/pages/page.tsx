import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/admin/Card";
import { PageStatusBadge } from "@/components/admin/StatusBadge";
import { getTemplateMeta } from "@/lib/mock-data";
import { getLandingPages } from "@/lib/landing-pages";
import { DeleteLandingPageButton } from "./DeleteLandingPageButton";
import { ToggleStatusButton } from "./ToggleStatusButton";

export default async function AdminPagesListPage() {
  const landingPages = await getLandingPages();

  return (
    <div>
      <PageHeader
        title="랜딩페이지 관리"
        description={`전체 ${landingPages.length}개의 랜딩페이지`}
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
        {landingPages.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-slate-500">
            아직 생성된 랜딩페이지가 없습니다.{" "}
            <Link href="/admin/pages/new" className="font-medium text-blue-600 hover:underline">
              첫 페이지를 만들어보세요.
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
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
                      <td className="px-6 py-4 font-mono text-xs">
                        {page.status === "public" ? (
                          <Link
                            href={`/${page.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            /{page.slug}
                          </Link>
                        ) : (
                          <span className="text-slate-400">/{page.slug}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{template?.name ?? page.template}</td>
                      <td className="px-6 py-4">
                        <PageStatusBadge status={page.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(page.createdAt).toLocaleDateString("ko-KR")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/pages/${page.id}/edit`}
                            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                          >
                            콘텐츠 편집
                          </Link>
                          <Link
                            href={`/preview/${page.template}`}
                            target="_blank"
                            className="rounded-md px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                          >
                            미리보기
                          </Link>
                          <ToggleStatusButton id={page.id} status={page.status} />
                          <button
                            type="button"
                            disabled
                            title="다음 단계에서 지원 예정입니다."
                            className="cursor-not-allowed rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-300"
                          >
                            복제
                          </button>
                          <DeleteLandingPageButton id={page.id} businessName={page.businessName} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
