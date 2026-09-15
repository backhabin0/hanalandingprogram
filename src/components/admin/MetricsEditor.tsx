"use client";

import { useActionState, useState } from "react";
import { FormField, FormSection } from "@/components/admin/FormField";
import { Input } from "@/components/admin/FormControls";
import { ActiveToggle, EditorSaveBar, ReorderControls } from "@/components/admin/EditorControls";
import type { LandingMetric } from "@/types/landing";
import { saveLandingMetricsAction, type MetricsFormState } from "@/app/admin/pages/[id]/edit/actions";

function newKey(): string {
  return typeof crypto !== "undefined" ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

interface MetricDraft {
  key: string;
  id?: string;
  label: string;
  value: string;
  description: string;
  isActive: boolean;
}

function toDraft(metric: LandingMetric): MetricDraft {
  return {
    key: metric.id,
    id: metric.id,
    label: metric.label,
    value: metric.value,
    description: metric.description ?? "",
    isActive: metric.isActive ?? true,
  };
}

function emptyDraft(): MetricDraft {
  return { key: newKey(), label: "", value: "", description: "", isActive: true };
}

const initialState: MetricsFormState = { error: null };

export function MetricsEditor({
  landingPageId,
  initialMetrics,
}: {
  landingPageId: string;
  initialMetrics: LandingMetric[];
}) {
  const boundAction = saveLandingMetricsAction.bind(null, landingPageId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const [items, setItems] = useState<MetricDraft[]>(() =>
    initialMetrics.length > 0 ? initialMetrics.map(toDraft) : [emptyDraft()]
  );

  const [syncedMetrics, setSyncedMetrics] = useState(state.metrics);
  // See ProductsEditor's syncTick for why: a <form action>'s native
  // post-submit reset writes checkbox `checked` on the DOM directly, and if
  // the refreshed value equals what React last rendered, React's prop diff
  // skips re-writing it, leaving a stale visual value. Keying the checkbox on
  // `syncTick` forces a fresh DOM node (and a fresh write) on every save.
  const [syncTick, setSyncTick] = useState(0);
  if (state.metrics !== syncedMetrics) {
    setSyncedMetrics(state.metrics);
    if (state.metrics) {
      setItems(state.metrics.length > 0 ? state.metrics.map(toDraft) : [emptyDraft()]);
    }
    setSyncTick((t) => t + 1);
  }

  function updateItem(index: number, patch: Partial<MetricDraft>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function moveItem(index: number, direction: -1 | 1) {
    setItems((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <form action={formAction}>
      <FormSection
        title="실적 / 숫자"
        description="누적 설치건수, 고객사 수 등 신뢰를 주는 숫자를 보여줍니다. 라벨과 값이 모두 있어야 저장됩니다."
      >
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.key} className="rounded-lg border border-slate-200 p-4">
              {item.id && <input type="hidden" name={`metrics[${index}].id`} value={item.id} />}
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-500">실적 #{index + 1}</p>
                <div className="flex items-center gap-2">
                  <ActiveToggle
                    key={`${item.key}-${syncTick}`}
                    name={`metrics[${index}].isActive`}
                    checked={item.isActive}
                    onChange={(isActive) => updateItem(index, { isActive })}
                  />
                  <ReorderControls
                    onMoveUp={() => moveItem(index, -1)}
                    onMoveDown={() => moveItem(index, 1)}
                    disableUp={index === 0}
                    disableDown={index === items.length - 1}
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setItems((prev) => prev.filter((m) => m.key !== item.key))}
                      className="text-xs font-medium text-rose-600 hover:text-rose-700"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <FormField label="값">
                  <Input
                    name={`metrics[${index}].value`}
                    placeholder="1,200+"
                    value={item.value}
                    onChange={(e) => updateItem(index, { value: e.target.value })}
                  />
                </FormField>
                <FormField label="라벨">
                  <Input
                    name={`metrics[${index}].label`}
                    placeholder="누적 설치 건수"
                    value={item.label}
                    onChange={(e) => updateItem(index, { label: e.target.value })}
                  />
                </FormField>
                <FormField label="보조 설명">
                  <Input
                    name={`metrics[${index}].description`}
                    placeholder="전국 매장·사옥·물류센터"
                    value={item.description}
                    onChange={(e) => updateItem(index, { description: e.target.value })}
                  />
                </FormField>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, emptyDraft()])}
          className="w-full rounded-lg border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-500 transition hover:border-blue-400 hover:text-blue-600"
        >
          + 실적/숫자 추가
        </button>

        <EditorSaveBar pending={pending} error={state.error} saved={!pending && state !== initialState && !state.error} />
      </FormSection>
    </form>
  );
}
