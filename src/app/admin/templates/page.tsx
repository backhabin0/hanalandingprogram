import Link from "next/link";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/admin/Card";
import { MiniTemplatePreview } from "@/components/admin/MiniTemplatePreview";
import { templates } from "@/lib/mock-data";

export default function AdminTemplatesPage() {
  return (
    <div>
      <PageHeader
        title="템플릿 관리"
        description="업종과 목적에 맞는 웹형 랜딩페이지 템플릿입니다. 실제 페이지 구성을 미리 확인해 보세요."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} padded={false} className="flex flex-col overflow-hidden">
            <MiniTemplatePreview templateId={template.id} />

            <div className="flex flex-1 flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    {template.nameEn}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">{template.name}</h2>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{template.description}</p>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  추천 업종
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {template.recommendedFor.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  대표 섹션 구성
                </p>
                <ol className="mt-2 space-y-1 text-sm text-slate-600">
                  {template.keySections.map((section, index) => (
                    <li key={section} className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-400">{index + 1}.</span>
                      {section}
                    </li>
                  ))}
                </ol>
              </div>

              <p className="mt-5 text-xs leading-relaxed text-slate-400">{template.visualDirection}</p>

              <div className="mt-6 flex gap-2">
                <Link
                  href={`/preview/${template.id}`}
                  target="_blank"
                  className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  전체 페이지 미리보기
                </Link>
                <Link
                  href="/admin/pages/new"
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  이 템플릿으로 만들기
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
