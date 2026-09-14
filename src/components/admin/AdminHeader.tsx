import Link from "next/link";

export function AdminHeader({ email }: { email: string }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="font-medium text-slate-900">관리자</span>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          공개 사이트 보기
        </Link>
        <div className="h-6 w-px bg-slate-200" />
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
            관
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium text-slate-900">관리자</p>
            <p className="text-[11px] text-slate-400">{email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
