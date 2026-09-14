import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { requireUser } from "@/lib/auth";

// Applies to every /admin/* page — an admin dashboard must never show up in
// Google/Naver search results.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // The actual access-control gate for all of /admin/*. Runs before any
  // child page renders, so an unauthenticated request redirects to /login
  // here — it never gets a flash of admin UI first.
  const user = await requireUser();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader email={user.email ?? "관리자"} />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
