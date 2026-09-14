import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "관리자 로그인",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  // Already-authenticated users never see the form — redirect from the
  // server before anything renders, not as a client-side afterthought.
  const user = await getCurrentUser();
  if (user) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white">
            H
          </div>
          <h1 className="mt-4 text-xl font-semibold text-slate-900">Hana LP Studio 관리자</h1>
          <p className="mt-1 text-sm text-slate-500">관리자 계정으로 로그인하세요.</p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-xs text-slate-400">
          관리자 계정은 Supabase Dashboard에서 생성됩니다. 회원가입은 지원하지 않습니다.
        </p>
      </div>
    </div>
  );
}
