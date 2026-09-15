"use client";

import { useActionState, useState } from "react";
import { FormField, FormSection } from "@/components/admin/FormField";
import { Input, Textarea } from "@/components/admin/FormControls";
import { ActiveToggle, EditorSaveBar, ReorderControls } from "@/components/admin/EditorControls";
import type { LandingProcessStep } from "@/types/landing";
import { saveLandingProcessStepsAction, type ProcessStepsFormState } from "@/app/admin/pages/[id]/edit/actions";

function newKey(): string {
  return typeof crypto !== "undefined" ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

interface ProcessStepDraft {
  key: string;
  id?: string;
  title: string;
  description: string;
  stepNumber: string;
  isActive: boolean;
}

function toDraft(step: LandingProcessStep): ProcessStepDraft {
  return {
    key: step.id,
    id: step.id,
    title: step.title,
    description: step.description,
    stepNumber: String(step.step ?? ""),
    isActive: step.isActive ?? true,
  };
}

function emptyDraft(): ProcessStepDraft {
  return { key: newKey(), title: "", description: "", stepNumber: "", isActive: true };
}

const initialState: ProcessStepsFormState = { error: null };

export function ProcessStepsEditor({
  landingPageId,
  initialSteps,
}: {
  landingPageId: string;
  initialSteps: LandingProcessStep[];
}) {
  const boundAction = saveLandingProcessStepsAction.bind(null, landingPageId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const [items, setItems] = useState<ProcessStepDraft[]>(() =>
    initialSteps.length > 0 ? initialSteps.map(toDraft) : [emptyDraft()]
  );

  const [syncedSteps, setSyncedSteps] = useState(state.processSteps);
  // See ProductsEditor's syncTick for why: a <form action>'s native
  // post-submit reset writes checkbox `checked` on the DOM directly, and if
  // the refreshed value equals what React last rendered, React's prop diff
  // skips re-writing it, leaving a stale visual value. Keying the checkbox on
  // `syncTick` forces a fresh DOM node (and a fresh write) on every save.
  const [syncTick, setSyncTick] = useState(0);
  if (state.processSteps !== syncedSteps) {
    setSyncedSteps(state.processSteps);
    if (state.processSteps) {
      setItems(state.processSteps.length > 0 ? state.processSteps.map(toDraft) : [emptyDraft()]);
    }
    setSyncTick((t) => t + 1);
  }

  function updateItem(index: number, patch: Partial<ProcessStepDraft>) {
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
        title="서비스 진행 과정"
        description="상담부터 사후관리까지 진행 절차를 보여줍니다. 순서는 아래 목록 순서로 저장되고, 화면에 표시할 번호는 따로 지정할 수 있습니다."
      >
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.key} className="rounded-lg border border-slate-200 p-4">
              {item.id && <input type="hidden" name={`processSteps[${index}].id`} value={item.id} />}
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-500">단계 #{index + 1}</p>
                <div className="flex items-center gap-2">
                  <ActiveToggle
                    key={`${item.key}-${syncTick}`}
                    name={`processSteps[${index}].isActive`}
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
                      onClick={() => setItems((prev) => prev.filter((s) => s.key !== item.key))}
                      className="text-xs font-medium text-rose-600 hover:text-rose-700"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[80px_1fr]">
                <FormField label="번호">
                  <Input
                    name={`processSteps[${index}].stepNumber`}
                    type="number"
                    placeholder={String(index + 1)}
                    value={item.stepNumber}
                    onChange={(e) => updateItem(index, { stepNumber: e.target.value })}
                  />
                </FormField>
                <FormField label="제목">
                  <Input
                    name={`processSteps[${index}].title`}
                    placeholder="예: 무료 상담 및 현장 실측"
                    value={item.title}
                    onChange={(e) => updateItem(index, { title: e.target.value })}
                  />
                </FormField>
              </div>
              <FormField label="설명">
                <Textarea
                  name={`processSteps[${index}].description`}
                  rows={2}
                  placeholder="이 단계에서 진행하는 내용을 설명하세요."
                  value={item.description}
                  onChange={(e) => updateItem(index, { description: e.target.value })}
                />
              </FormField>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, emptyDraft()])}
          className="w-full rounded-lg border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-500 transition hover:border-blue-400 hover:text-blue-600"
        >
          + 진행 단계 추가
        </button>

        <EditorSaveBar pending={pending} error={state.error} saved={!pending && state !== initialState && !state.error} />
      </FormSection>
    </form>
  );
}
