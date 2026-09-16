"use client";

import { useState, useTransition } from "react";
import { updateConsultationStatusAction } from "./actions";
import { CONSULTATION_STATUSES, CONSULTATION_STATUS_LABEL } from "@/lib/consultation-requests";
import type { ConsultationStatus } from "@/types/landing";
import { cn } from "@/lib/utils";

/**
 * A plain controlled `<select>`, not `useActionState` — same reasoning as
 * `ConsultationForm`: this project has a known bug class where a
 * `<form action>`'s native reset can leave a controlled input visually
 * stale after the action settles. A direct call from `onChange` + local
 * state has no native form/reset step to go stale.
 */
export function StatusSelect({ id, status }: { id: string; status: ConsultationStatus }) {
  const [value, setValue] = useState(status);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as ConsultationStatus;
    const previous = value;
    setValue(next);
    setError(null);
    startTransition(async () => {
      const result = await updateConsultationStatusAction(id, next);
      if (result.error) {
        setValue(previous);
        setError(result.error);
      }
    });
  }

  return (
    <div>
      <select
        value={value}
        onChange={handleChange}
        disabled={pending}
        className={cn(
          "rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 outline-none focus:border-blue-500",
          pending && "opacity-60"
        )}
      >
        {CONSULTATION_STATUSES.map((s) => (
          <option key={s} value={s}>
            {CONSULTATION_STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-[11px] text-rose-600">{error}</p>}
    </div>
  );
}
