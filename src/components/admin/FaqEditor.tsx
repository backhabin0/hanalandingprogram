"use client";

import { useActionState, useState } from "react";
import { FormField, FormSection } from "@/components/admin/FormField";
import { Input, Textarea } from "@/components/admin/FormControls";
import { ActiveToggle, EditorSaveBar, ReorderControls } from "@/components/admin/EditorControls";
import type { LandingFaq } from "@/types/landing";
import { saveLandingFaqsAction, type FaqsFormState } from "@/app/admin/pages/[id]/edit/actions";

function newKey(): string {
  return typeof crypto !== "undefined" ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

interface FaqDraft {
  key: string;
  id?: string;
  question: string;
  answer: string;
  isActive: boolean;
}

function toDraft(faq: LandingFaq): FaqDraft {
  return {
    key: faq.id,
    id: faq.id,
    question: faq.question,
    answer: faq.answer,
    isActive: faq.isActive ?? true,
  };
}

function emptyDraft(): FaqDraft {
  return { key: newKey(), question: "", answer: "", isActive: true };
}

const initialState: FaqsFormState = { error: null };

export function FaqEditor({ landingPageId, initialFaqs }: { landingPageId: string; initialFaqs: LandingFaq[] }) {
  const boundAction = saveLandingFaqsAction.bind(null, landingPageId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const [items, setItems] = useState<FaqDraft[]>(() =>
    initialFaqs.length > 0 ? initialFaqs.map(toDraft) : [emptyDraft()]
  );

  const [syncedFaqs, setSyncedFaqs] = useState(state.faqs);
  // See ProductsEditor's syncTick for why: a <form action>'s native
  // post-submit reset writes checkbox `checked` on the DOM directly, and if
  // the refreshed value equals what React last rendered, React's prop diff
  // skips re-writing it, leaving a stale visual value. Keying the checkbox on
  // `syncTick` forces a fresh DOM node (and a fresh write) on every save.
  const [syncTick, setSyncTick] = useState(0);
  if (state.faqs !== syncedFaqs) {
    setSyncedFaqs(state.faqs);
    if (state.faqs) {
      setItems(state.faqs.length > 0 ? state.faqs.map(toDraft) : [emptyDraft()]);
    }
    setSyncTick((t) => t + 1);
  }

  function updateItem(index: number, patch: Partial<FaqDraft>) {
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
        title="FAQ"
        description="자주 묻는 질문과 답변입니다. 검색/AEO에 중요하니 답변을 충분히 작성해 주세요."
      >
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.key} className="rounded-lg border border-slate-200 p-4">
              {item.id && <input type="hidden" name={`faqs[${index}].id`} value={item.id} />}
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-500">FAQ #{index + 1}</p>
                <div className="flex items-center gap-2">
                  <ActiveToggle
                    key={`${item.key}-${syncTick}`}
                    name={`faqs[${index}].isActive`}
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
              <FormField label="질문">
                <Input
                  name={`faqs[${index}].question`}
                  placeholder="예: 설치 비용은 얼마인가요?"
                  value={item.question}
                  onChange={(e) => updateItem(index, { question: e.target.value })}
                />
              </FormField>
              <FormField label="답변" hint="충분히 길게 작성할수록 검색/AI 답변 노출에 유리합니다.">
                <Textarea
                  name={`faqs[${index}].answer`}
                  rows={5}
                  placeholder="질문에 대한 답변을 자세히 작성하세요."
                  value={item.answer}
                  onChange={(e) => updateItem(index, { answer: e.target.value })}
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
          + FAQ 추가
        </button>

        <EditorSaveBar pending={pending} error={state.error} saved={!pending && state !== initialState && !state.error} />
      </FormSection>
    </form>
  );
}
