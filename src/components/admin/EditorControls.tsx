"use client";

import { cn } from "@/lib/utils";

/** Up/down reorder buttons — sort_order is always recomputed server-side from array position, so this is the entire reordering UI (no drag-and-drop library). */
export function ReorderControls({
  onMoveUp,
  onMoveDown,
  disableUp,
  disableDown,
}: {
  onMoveUp: () => void;
  onMoveDown: () => void;
  disableUp?: boolean;
  disableDown?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onMoveUp}
        disabled={disableUp}
        aria-label="위로 이동"
        className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ↑
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={disableDown}
        aria-label="아래로 이동"
        className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ↓
      </button>
    </div>
  );
}

export function ActiveToggle({
  name,
  checked,
  onChange,
}: {
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="inline-flex shrink-0 items-center gap-2 text-sm text-slate-600">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30"
      />
      공개 노출
    </label>
  );
}

export function EditorSaveBar({
  pending,
  error,
  saved,
  label = "저장",
}: {
  pending: boolean;
  error: string | null;
  /** True right after a successful save (until the next submit) — shows a quiet confirmation. */
  saved: boolean;
  label?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
      <div className="text-sm">
        {error ? (
          <p className="text-rose-600" role="alert">
            {error}
          </p>
        ) : saved ? (
          <p className="text-emerald-600">저장되었습니다.</p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={pending}
        className={cn(
          "shrink-0 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700",
          "disabled:cursor-not-allowed disabled:opacity-60"
        )}
      >
        {pending ? "저장 중..." : label}
      </button>
    </div>
  );
}
