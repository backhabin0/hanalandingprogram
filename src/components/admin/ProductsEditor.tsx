"use client";

import { useActionState, useState } from "react";
import { FormField, FormSection } from "@/components/admin/FormField";
import { Input, Textarea } from "@/components/admin/FormControls";
import { ActiveToggle, EditorSaveBar, ReorderControls } from "@/components/admin/EditorControls";
import type { LandingProduct } from "@/types/landing";
import { saveLandingProductsAction, type ProductsFormState } from "@/app/admin/pages/[id]/edit/actions";

function newKey(): string {
  return typeof crypto !== "undefined" ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

interface ProductDraft {
  key: string;
  id?: string;
  name: string;
  shortDescription: string;
  description: string;
  priceLabel: string;
  price: string;
  priceUnit: string;
  priceNote: string;
  ctaText: string;
  isActive: boolean;
}

function toDraft(product: LandingProduct): ProductDraft {
  return {
    key: product.id,
    id: product.id,
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    priceLabel: product.priceLabel ?? "",
    price: product.price ?? "",
    priceUnit: product.priceUnit ?? "",
    priceNote: product.priceNote ?? "",
    ctaText: product.ctaText ?? "",
    isActive: product.isActive ?? true,
  };
}

function emptyDraft(): ProductDraft {
  return {
    key: newKey(),
    name: "",
    shortDescription: "",
    description: "",
    priceLabel: "",
    price: "",
    priceUnit: "",
    priceNote: "",
    ctaText: "",
    isActive: true,
  };
}

const initialState: ProductsFormState = { error: null };

export function ProductsEditor({
  landingPageId,
  initialProducts,
}: {
  landingPageId: string;
  initialProducts: LandingProduct[];
}) {
  const boundAction = saveLandingProductsAction.bind(null, landingPageId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const [items, setItems] = useState<ProductDraft[]>(() =>
    initialProducts.length > 0 ? initialProducts.map(toDraft) : [emptyDraft()]
  );

  // On a successful save the server returns the DB-confirmed rows (real ids
  // for anything newly inserted) — replace local drafts with those instead
  // of trusting whatever the form happened to hold, so ids never drift from
  // what `landing_specifications.product_id` can actually reference. Adjusted
  // during render (React's documented pattern for this) rather than in a
  // `useEffect`, which would commit the stale draft for one extra frame.
  const [syncedProducts, setSyncedProducts] = useState(state.products);
  // Bumped once per successful save, alongside the sync above. React 19's
  // <form action> does a native `form.reset()` after the action settles,
  // which writes each checkbox's DOM `checked` property directly — bypassing
  // React. If the fresh `isActive` value happens to equal what React last
  // rendered, React's host-prop diff sees "no change" and skips re-writing
  // `checked`, leaving the native reset's value on screen even though state
  // (and the DB) are correct. Keying the checkbox on `syncTick` forces React
  // to throw away that DOM node and mount a new one on every save, which
  // always writes `checked` fresh — no diff to bail out of.
  const [syncTick, setSyncTick] = useState(0);
  if (state.products !== syncedProducts) {
    setSyncedProducts(state.products);
    if (state.products) {
      setItems(state.products.length > 0 ? state.products.map(toDraft) : [emptyDraft()]);
    }
    setSyncTick((t) => t + 1);
  }

  // Fields are controlled (value + onChange), not defaultValue: a <form
  // action> resets its uncontrolled inputs once the action settles — on a
  // validation error that would silently wipe everything the admin just
  // typed. Keeping `items` as the single source of truth avoids that.
  function updateItem(index: number, patch: Partial<ProductDraft>) {
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
        title="제품 / 서비스"
        description="하나의 랜딩페이지에 여러 제품 또는 서비스를 등록할 수 있습니다. 이름이 비어있는 항목은 저장되지 않습니다."
      >
        <div className="space-y-5">
          {items.map((item, index) => (
            <div key={item.key} className="rounded-lg border border-slate-200 p-5">
              {item.id && <input type="hidden" name={`products[${index}].id`} value={item.id} />}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-700">제품/서비스 #{index + 1}</p>
                <div className="flex items-center gap-3">
                  <ActiveToggle
                    key={`${item.key}-${syncTick}`}
                    name={`products[${index}].isActive`}
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
                      onClick={() => setItems((prev) => prev.filter((p) => p.key !== item.key))}
                      className="text-xs font-medium text-rose-600 hover:text-rose-700"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField label="서비스명">
                  <Input
                    name={`products[${index}].name`}
                    placeholder="예: 4K CCTV 설치"
                    value={item.name}
                    onChange={(e) => updateItem(index, { name: e.target.value })}
                  />
                </FormField>
                <FormField label="짧은 설명" hint="목록/카드에 노출되는 한 줄 요약">
                  <Input
                    name={`products[${index}].shortDescription`}
                    placeholder="예: 실내외 전 구역을 선명하게 기록하는 4K UHD 카메라 설치"
                    value={item.shortDescription}
                    onChange={(e) => updateItem(index, { shortDescription: e.target.value })}
                  />
                </FormField>
              </div>
              <FormField label="상세 설명" hint="검색엔진이 읽을 수 있는 실제 본문 텍스트입니다. 충분히 작성해 주세요.">
                <Textarea
                  name={`products[${index}].description`}
                  rows={4}
                  placeholder="서비스에 대한 상세 설명을 입력하세요."
                  value={item.description}
                  onChange={(e) => updateItem(index, { description: e.target.value })}
                />
              </FormField>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField label="가격 라벨">
                  <Input
                    name={`products[${index}].priceLabel`}
                    placeholder="예: 정가 / 프로모션가"
                    value={item.priceLabel}
                    onChange={(e) => updateItem(index, { priceLabel: e.target.value })}
                  />
                </FormField>
                <FormField label="CTA 문구">
                  <Input
                    name={`products[${index}].ctaText`}
                    placeholder="예: 무료 견적 받기"
                    value={item.ctaText}
                    onChange={(e) => updateItem(index, { ctaText: e.target.value })}
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <FormField label="가격">
                  <Input
                    name={`products[${index}].price`}
                    placeholder="158만원"
                    value={item.price}
                    onChange={(e) => updateItem(index, { price: e.target.value })}
                  />
                </FormField>
                <FormField label="가격 단위">
                  <Input
                    name={`products[${index}].priceUnit`}
                    placeholder="부터 / 월 / 회당"
                    value={item.priceUnit}
                    onChange={(e) => updateItem(index, { priceUnit: e.target.value })}
                  />
                </FormField>
                <FormField label="가격 설명">
                  <Input
                    name={`products[${index}].priceNote`}
                    placeholder="카메라 4대 기준"
                    value={item.priceNote}
                    onChange={(e) => updateItem(index, { priceNote: e.target.value })}
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
          + 제품/서비스 추가
        </button>

        <EditorSaveBar pending={pending} error={state.error} saved={!pending && state !== initialState && !state.error} />
      </FormSection>
    </form>
  );
}
