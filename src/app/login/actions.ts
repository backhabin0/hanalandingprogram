"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface LoginFormState {
  error: string | null;
}

const EMAIL_MAX_LENGTH = 254;
const PASSWORD_MAX_LENGTH = 200;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Never show Supabase's raw auth error — it can hint at whether an account exists. */
const INVALID_CREDENTIALS_MESSAGE = "이메일 또는 비밀번호를 확인해주세요.";

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  // Server-side validation — never trust the client alone.
  if (!email || !password) {
    return { error: "이메일과 비밀번호를 모두 입력해주세요." };
  }
  if (email.length > EMAIL_MAX_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    return { error: "입력값이 너무 깁니다." };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { error: "올바른 이메일 형식이 아닙니다." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // TEMPORARY (Vercel login-failure diagnosis) — logs only Supabase's own
    // safe error fields (status/code/message), never the password or API
    // key. Remove once the "works locally, fails on Vercel" issue is
    // root-caused.
    console.error("[loginAction] signInWithPassword failed:", {
      status: error.status,
      code: error.code,
      message: error.message,
    });
    return { error: INVALID_CREDENTIALS_MESSAGE };
  }

  // TEMPORARY (Vercel login-failure diagnosis) — confirms signIn actually
  // succeeded and a session was returned, before whatever happens next
  // (cookie write, redirect) — never logs the user's email/password/token.
  console.log("[loginAction] signInWithPassword OK, user id present:", Boolean(data.user?.id));

  redirect("/admin");
}
