"use client";

import { useTransition } from "react";
import { deleteLandingPageAction } from "./actions";

export function DeleteLandingPageButton({ id, businessName }: { id: string; businessName: string }) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`"${businessName}" 페이지를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) return;
    startTransition(() => {
      void deleteLandingPageAction(id);
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="rounded-md px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
    >
      {pending ? "삭제 중..." : "삭제"}
    </button>
  );
}
