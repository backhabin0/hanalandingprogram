import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

// Applies to every /preview/* page — these render mock template data, not a
// real customer page, so they must never appear in search results.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PreviewLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="flex items-center justify-between gap-4 bg-slate-900 px-4 py-2 text-xs text-slate-300 sm:px-6">
        <span>
          🔎 템플릿 미리보기 모드 — mock 데이터로 구성된 화면이며 실제 게시된 페이지가 아닙니다.
        </span>
        <Link href="/admin/templates" className="shrink-0 font-medium text-white hover:underline">
          템플릿 관리로 돌아가기
        </Link>
      </div>
      {children}
    </div>
  );
}
