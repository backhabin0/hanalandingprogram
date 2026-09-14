"use client";

import { useActionState } from "react";
import { FormField } from "@/components/admin/FormField";
import { Input } from "@/components/admin/FormControls";
import { loginAction, type LoginFormState } from "./actions";

const initialState: LoginFormState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <FormField label="이메일" required>
        <Input
          type="email"
          name="email"
          placeholder="admin@example.com"
          required
          autoComplete="email"
          autoFocus
        />
      </FormField>

      <FormField label="비밀번호" required>
        <Input
          type="password"
          name="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
      </FormField>

      {state.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
}
