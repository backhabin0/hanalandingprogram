import Link from "next/link";
import { templates } from "@/lib/mock-data";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-slate-950 text-white">
      <main className="mx-auto flex w-full max-w-[1000px] flex-1 flex-col justify-center px-6 py-24">
        <span className="text-sm font-semibold uppercase tracking-wide text-blue-400">
          Hana LP Studio · Stage 1
        </span>
        <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          업종별 웹형 랜딩페이지를 자동으로 생성하고 관리하는 CMS
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-400">
          이번 단계는 프로젝트 기본 구조, 관리자 UI, 웹형 공개 랜딩페이지 디자인 시스템까지만
          구현되어 있습니다. DB · 로그인 · 실제 저장 기능은 다음 단계에서 연결됩니다.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/admin"
            className="rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            관리자 대시보드로 이동
          </Link>
          <Link
            href="/admin/templates"
            className="rounded-lg border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            템플릿 둘러보기
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {templates.map((template) => (
            <Link
              key={template.id}
              href={`/preview/${template.id}`}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {template.nameEn}
              </p>
              <p className="mt-1.5 text-base font-semibold text-white">{template.name}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{template.purpose}</p>
              <span className="mt-4 inline-block text-sm font-medium text-blue-400">
                미리보기 →
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
