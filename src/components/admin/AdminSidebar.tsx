"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/admin/actions";

const NAV_ITEMS = [
  { href: "/admin", label: "대시보드", icon: "🏠", exact: true },
  { href: "/admin/pages", label: "랜딩페이지 관리", icon: "📄", exact: false },
  { href: "/admin/pages/new", label: "새 페이지 만들기", icon: "➕", exact: false },
  { href: "/admin/templates", label: "템플릿 관리", icon: "🎨", exact: false },
  { href: "/admin/consultations", label: "상담 관리", icon: "💬", exact: false },
  { href: "/admin/analytics", label: "통계", icon: "📈", exact: false },
  { href: "/admin/settings", label: "설정", icon: "⚙️", exact: false },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-slate-300">
      <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 text-sm font-bold text-white">
          H
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">Hana LP Studio</p>
          <p className="text-[11px] text-slate-500">랜딩페이지 관리 시스템</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-600/15 text-white ring-1 ring-inset ring-blue-500/30"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
              )}
            >
              <span className="text-base leading-none" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 px-3 py-4">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-900 hover:text-slate-100"
          >
            <span className="text-base leading-none" aria-hidden>
              🚪
            </span>
            로그아웃
          </button>
        </form>
      </div>
    </aside>
  );
}
