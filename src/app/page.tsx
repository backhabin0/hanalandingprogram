import type { Metadata } from "next";
import Link from "next/link";
import { templates } from "@/lib/mock-data";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-slate-950 text-white">
      <main className="mx-auto flex w-full max-w-[1000px] flex-1 flex-col justify-center px-6 py-24">
        <span className="text-sm font-semibold uppercase tracking-wide text-blue-400">
          Hana LP Studio
        </span>
        <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          업종별 웹형 랜딩페이지를 자동으로 생성하고 관리하는 CMS
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-400">
          업체 정보, 제품/서비스, 사례, FAQ를 입력하면 SEO가 적용된 랜딩페이지가
          자동으로 만들어집니다.
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
