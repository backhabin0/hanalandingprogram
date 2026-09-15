"use client";

import { useActionState, useState } from "react";
import { FormField, FormSection } from "@/components/admin/FormField";
import { Input, Select } from "@/components/admin/FormControls";
import { ActiveToggle, EditorSaveBar, ReorderControls } from "@/components/admin/EditorControls";
import type { LandingSpecification } from "@/types/landing";
import { saveLandingSpecificationsAction, type SpecificationsFormState } from "@/app/admin/pages/[id]/edit/actions";

function newKey(): string {
  return typeof crypto !== "undefined" ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

interface SpecificationDraft {
  key: string;
  id?: string;
  productId: string;
  groupName: string;
  specKey: string;
  specValue: string;
  isActive: boolean;
}

function toDraft(spec: LandingSpecification): SpecificationDraft {
  return {
    key: spec.id,
    id: spec.id,
    productId: spec.productId ?? "",
    groupName: spec.groupName ?? "",
    specKey: spec.key,
    specValue: spec.value,
    isActive: spec.isActive ?? true,
  };
}

function emptyDraft(): SpecificationDraft {
  return { key: newKey(), productId: "", groupName: "", specKey: "", specValue: "", isActive: true };
}

const initialState: SpecificationsFormState = { error: null };

export function SpecificationsEditor({
  landingPageId,
  initialSpecifications,
  products,
}: {
  landingPageId: string;
  initialSpecifications: LandingSpecification[];
  /** Current products on this page, for the "적용 대상" dropdown. Only already-saved products can be picked — save the Products section first for a brand-new product to show up here. */
  products: { id: string; name: string }[];
}) {
  const boundAction = saveLandingSpecificationsAction.bind(null, landingPageId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const [items, setItems] = useState<SpecificationDraft[]>(() =>
    initialSpecifications.length > 0 ? initialSpecifications.map(toDraft) : [emptyDraft()]
  );

  const [syncedSpecifications, setSyncedSpecifications] = useState(state.specifications);
  // See ProductsEditor's syncTick for why: a <form action>'s native
  // post-submit reset writes checkbox `checked` on the DOM directly, and if
  // the refreshed value equals what React last rendered, React's prop diff
  // skips re-writing it, leaving a stale visual value. Keying the checkbox on
  // `syncTick` forces a fresh DOM node (and a fresh write) on every save.
  const [syncTick, setSyncTick] = useState(0);
  if (state.specifications !== syncedSpecifications) {
    setSyncedSpecifications(state.specifications);
    if (state.specifications) {
      setItems(state.specifications.length > 0 ? state.specifications.map(toDraft) : [emptyDraft()]);
    }
    setSyncTick((t) => t + 1);
  }

  function updateItem(index: number, patch: Partial<SpecificationDraft>) {
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
        title="제품 사양"
        description="페이지 전체 공통 사양이거나, 특정 제품에 연결된 사양일 수 있습니다. 항목명과 값이 모두 있어야 저장됩니다."
      >
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.key} className="rounded-lg border border-slate-200 p-4">
              {item.id && <input type="hidden" name={`specifications[${index}].id`} value={item.id} />}
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-500">사양 #{index + 1}</p>
                <div className="flex items-center gap-2">
                  <ActiveToggle
                    key={`${item.key}-${syncTick}`}
                    name={`specifications[${index}].isActive`}
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
              <FormField label="적용 대상" hint="특정 제품을 선택하면 그 제품의 사양으로 연결됩니다.">
                <Select
                  name={`specifications[${index}].productId`}
                  value={item.productId}
                  onChange={(e) => updateItem(index, { productId: e.target.value })}
                >
                  <option value="">페이지 전체 공통</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <FormField label="그룹명" hint="예: 카메라, 저장장치">
                  <Input
                    name={`specifications[${index}].groupName`}
                    placeholder="예: 카메라"
                    value={item.groupName}
                    onChange={(e) => updateItem(index, { groupName: e.target.value })}
                  />
                </FormField>
                <FormField label="항목명">
                  <Input
                    name={`specifications[${index}].specKey`}
                    placeholder="해상도"
                    value={item.specKey}
                    onChange={(e) => updateItem(index, { specKey: e.target.value })}
                  />
                </FormField>
                <FormField label="값">
                  <Input
                    name={`specifications[${index}].specValue`}
                    placeholder="4K UHD"
                    value={item.specValue}
                    onChange={(e) => updateItem(index, { specValue: e.target.value })}
                  />
                </FormField>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <p className="text-xs text-slate-400">
            제품별 사양을 연결하려면 먼저 위 &ldquo;제품 / 서비스&rdquo;를 저장해 주세요. 지금은 페이지 전체 공통 사양만 추가할 수 있습니다.
          </p>
        )}

        <button
          type="button"
          onClick={() => setItems((prev) => [...prev, emptyDraft()])}
          className="w-full rounded-lg border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-500 transition hover:border-blue-400 hover:text-blue-600"
        >
          + 사양 추가
        </button>

        <EditorSaveBar pending={pending} error={state.error} saved={!pending && state !== initialState && !state.error} />
      </FormSection>
    </form>
  );
}
