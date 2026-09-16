"use client";

import { useActionState, useState } from "react";
import { FormField, FormSection } from "@/components/admin/FormField";
import { Input, Select, Textarea } from "@/components/admin/FormControls";
import { ActiveToggle, EditorSaveBar, ReorderControls } from "@/components/admin/EditorControls";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import type { LandingCase } from "@/types/landing";
import { saveLandingCasesAction, type CasesFormState } from "@/app/admin/pages/[id]/edit/actions";
import { removeCaseImageAction, uploadCaseImageAction } from "@/app/admin/pages/[id]/edit/image-actions";

function newKey(): string {
  return typeof crypto !== "undefined" ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

interface CaseDraft {
  key: string;
  id?: string;
  productId: string;
  title: string;
  description: string;
  region: string;
  industry: string;
  caseDate: string;
  imageUrl: string;
  isActive: boolean;
}

function toDraft(item: LandingCase): CaseDraft {
  return {
    key: item.id,
    id: item.id,
    productId: item.productId ?? "",
    title: item.title,
    description: item.description ?? "",
    region: item.region ?? "",
    industry: item.industry ?? "",
    caseDate: item.caseDate ?? "",
    imageUrl: item.imageUrl ?? "",
    isActive: item.isActive ?? true,
  };
}

function emptyDraft(): CaseDraft {
  return {
    key: newKey(),
    productId: "",
    title: "",
    description: "",
    region: "",
    industry: "",
    caseDate: "",
    imageUrl: "",
    isActive: true,
  };
}

const initialState: CasesFormState = { error: null };

export function CasesEditor({
  landingPageId,
  initialCases,
  products,
}: {
  landingPageId: string;
  initialCases: LandingCase[];
  /** Current products on this page, for the "관련 제품" dropdown. */
  products: { id: string; name: string }[];
}) {
  const boundAction = saveLandingCasesAction.bind(null, landingPageId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const [items, setItems] = useState<CaseDraft[]>(() => initialCases.map(toDraft));

  const [syncedCases, setSyncedCases] = useState(state.cases);
  const [syncTick, setSyncTick] = useState(0);
  if (state.cases !== syncedCases) {
    setSyncedCases(state.cases);
    if (state.cases) setItems(state.cases.map(toDraft));
    setSyncTick((t) => t + 1);
  }

  function updateItem(index: number, patch: Partial<CaseDraft>) {
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
        title="설치 / 시공 사례"
        description="실제 시공·설치·이용 사례를 등록하면 지역 검색 경쟁력에 도움이 됩니다. 가짜 사례는 등록하지 마세요."
      >
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.key} className="rounded-lg border border-slate-200 p-4">
              {item.id && <input type="hidden" name={`cases[${index}].id`} value={item.id} />}
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-500">사례 #{index + 1}</p>
                <div className="flex items-center gap-2">
                  <ActiveToggle
                    key={`active-${item.key}-${syncTick}`}
                    name={`cases[${index}].isActive`}
                    checked={item.isActive}
                    onChange={(isActive) => updateItem(index, { isActive })}
                  />
                  <ReorderControls
                    onMoveUp={() => moveItem(index, -1)}
                    onMoveDown={() => moveItem(index, 1)}
                    disableUp={index === 0}
                    disableDown={index === items.length - 1}
                  />
                  <button
                    type="button"
                    onClick={() => setItems((prev) => prev.filter((c) => c.key !== item.key))}
                    className="text-xs font-medium text-rose-600 hover:text-rose-700"
                  >
                    삭제
                  </button>
                </div>
              </div>

              <FormField label="제목">
                <Input
                  name={`cases[${index}].title`}
                  placeholder="예: 전주 덕진구 OO학원 복합기 설치"
                  value={item.title}
                  onChange={(e) => updateItem(index, { title: e.target.value })}
                />
              </FormField>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <FormField label="지역">
                  <Input
                    name={`cases[${index}].region`}
                    placeholder="전주시 덕진구"
                    value={item.region}
                    onChange={(e) => updateItem(index, { region: e.target.value })}
                  />
                </FormField>
                <FormField label="업종">
                  <Input
                    name={`cases[${index}].industry`}
                    placeholder="학원"
                    value={item.industry}
                    onChange={(e) => updateItem(index, { industry: e.target.value })}
                  />
                </FormField>
                <FormField label="날짜" hint="선택 사항">
                  <Input
                    name={`cases[${index}].caseDate`}
                    type="date"
                    value={item.caseDate}
                    onChange={(e) => updateItem(index, { caseDate: e.target.value })}
                  />
                </FormField>
              </div>

              <FormField label="관련 제품/서비스" hint="선택 사항 — 저장된 제품만 연결할 수 있습니다.">
                <Select
                  key={`productId-${item.key}-${syncTick}`}
                  name={`cases[${index}].productId`}
                  value={item.productId}
                  onChange={(e) => updateItem(index, { productId: e.target.value })}
                >
                  <option value="">연결 안 함</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="설명">
                <Textarea
                  name={`cases[${index}].description`}
                  rows={3}
                  placeholder="실제 시공/설치 내용을 구체적으로 작성하세요."
                  value={item.description}
                  onChange={(e) => updateItem(index, { description: e.target.value })}
                />
              </FormField>

              {item.id ? (
                <ImageUploadField
                  label="사례 이미지"
                  ratio="aspect-[4/3]"
                  currentUrl={item.imageUrl}
                  altText={item.title || "설치 사례 이미지"}
                  uploadAction={(formData) => uploadCaseImageAction(landingPageId, item.id!, formData)}
                  removeAction={() => removeCaseImageAction(landingPageId, item.id!)}
                  onChange={(url) => updateItem(index, { imageUrl: url ?? "" })}
                />
              ) : (
                <FormField label="이미지 URL" hint="선택 사항 — 먼저 저장한 뒤 이미지를 업로드할 수 있습니다. 외부 URL도 직접 입력할 수 있습니다.">
                  <Input
                    name={`cases[${index}].imageUrl`}
                    type="url"
                    placeholder="https://example.com/case.jpg"
                    value={item.imageUrl}
                    onChange={(e) => updateItem(index, { imageUrl: e.target.value })}
                  />
                </FormField>
              )}
              {item.id && (
                <input type="hidden" name={`cases[${index}].imageUrl`} value={item.imageUrl} />
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, emptyDraft()])}
          className="w-full rounded-lg border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-500 transition hover:border-blue-400 hover:text-blue-600"
        >
          + 사례 추가
        </button>

        <EditorSaveBar pending={pending} error={state.error} saved={!pending && state !== initialState && !state.error} />
      </FormSection>
    </form>
  );
}
