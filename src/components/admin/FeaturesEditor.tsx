"use client";

import { useActionState, useState } from "react";
import { FormSection } from "@/components/admin/FormField";
import { Input, Textarea } from "@/components/admin/FormControls";
import { ActiveToggle, EditorSaveBar, ReorderControls } from "@/components/admin/EditorControls";
import type { LandingFeature } from "@/types/landing";
import { saveLandingFeaturesAction, type FeaturesFormState } from "@/app/admin/pages/[id]/edit/actions";

function newKey(): string {
  return typeof crypto !== "undefined" ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

interface FeatureDraft {
  key: string;
  id?: string;
  title: string;
  description: string;
  icon: string;
  isActive: boolean;
}

function toDraft(feature: LandingFeature): FeatureDraft {
  return {
    key: feature.id,
    id: feature.id,
    title: feature.title,
    description: feature.description,
    icon: feature.icon ?? "",
    isActive: feature.isActive ?? true,
  };
}

function emptyDraft(): FeatureDraft {
  return { key: newKey(), title: "", description: "", icon: "", isActive: true };
}

const initialState: FeaturesFormState = { error: null };

export function FeaturesEditor({
  landingPageId,
  initialFeatures,
}: {
  landingPageId: string;
  initialFeatures: LandingFeature[];
}) {
  const boundAction = saveLandingFeaturesAction.bind(null, landingPageId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const [items, setItems] = useState<FeatureDraft[]>(() =>
    initialFeatures.length > 0 ? initialFeatures.map(toDraft) : [emptyDraft(), emptyDraft()]
  );

  const [syncedFeatures, setSyncedFeatures] = useState(state.features);
  // See ProductsEditor's syncTick for why: a <form action>'s native
  // post-submit reset writes checkbox `checked` on the DOM directly, and if
  // the refreshed value equals what React last rendered, React's prop diff
  // skips re-writing it, leaving a stale visual value. Keying the checkbox on
  // `syncTick` forces a fresh DOM node (and a fresh write) on every save.
  const [syncTick, setSyncTick] = useState(0);
  if (state.features !== syncedFeatures) {
    setSyncedFeatures(state.features);
    if (state.features) {
      setItems(state.features.length > 0 ? state.features.map(toDraft) : [emptyDraft(), emptyDraft()]);
    }
    setSyncTick((t) => t + 1);
  }

  function updateItem(index: number, patch: Partial<FeatureDraft>) {
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
        title="핵심 특징"
        description="차별점이나 강점을 보여줍니다. 제목이 비어있는 항목은 저장되지 않습니다."
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {items.map((item, index) => (
            <div key={item.key} className="rounded-lg border border-slate-200 p-4">
              {item.id && <input type="hidden" name={`features[${index}].id`} value={item.id} />}
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-500">특징 #{index + 1}</p>
                <div className="flex items-center gap-2">
                  <ActiveToggle
                    key={`${item.key}-${syncTick}`}
                    name={`features[${index}].isActive`}
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
                      onClick={() => setItems((prev) => prev.filter((f) => f.key !== item.key))}
                      className="text-xs font-medium text-rose-600 hover:text-rose-700"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <Input
                  name={`features[${index}].title`}
                  placeholder="제목 (예: 4K UHD)"
                  value={item.title}
                  onChange={(e) => updateItem(index, { title: e.target.value })}
                />
                <Textarea
                  name={`features[${index}].description`}
                  rows={2}
                  placeholder="설명"
                  value={item.description}
                  onChange={(e) => updateItem(index, { description: e.target.value })}
                />
                <Input
                  name={`features[${index}].icon`}
                  placeholder="아이콘(선택, 이모지) 예: 🎥"
                  value={item.icon}
                  onChange={(e) => updateItem(index, { icon: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, emptyDraft()])}
          className="w-full rounded-lg border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-500 transition hover:border-blue-400 hover:text-blue-600"
        >
          + 특징 추가
        </button>

        <EditorSaveBar pending={pending} error={state.error} saved={!pending && state !== initialState && !state.error} />
      </FormSection>
    </form>
  );
}
