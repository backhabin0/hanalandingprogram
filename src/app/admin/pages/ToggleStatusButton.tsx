"use client";

import { useTransition } from "react";
import { toggleLandingPageStatusAction } from "./actions";
import type { LandingPageStatus } from "@/types/landing";

export function ToggleStatusButton({ id, status }: { id: string; status: LandingPageStatus }) {
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(() => {
      void toggleLandingPageStatusAction(id, status);
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={pending}
      className="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
    >
      {pending ? "변경 중..." : status === "public" ? "비공개로 전환" : "공개로 전환"}
    </button>
  );
}
