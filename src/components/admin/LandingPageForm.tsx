"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { FormField, FormSection } from "@/components/admin/FormField";
import { Input, Select, Textarea } from "@/components/admin/FormControls";
import { MiniTemplatePreview } from "@/components/admin/MiniTemplatePreview";
import { cn } from "@/lib/utils";
import { templates } from "@/lib/mock-data";
import type {
  LandingFeature,
  LandingPageStatus,
  LandingPriceSummary,
  LandingProduct,
  LandingTemplateId,
} from "@/types/landing";
import type { LandingPageFormState } from "@/app/admin/pages/actions";

function newKey(): string {
  return typeof crypto !== "undefined" ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

interface ProductDraft {
  key: string;
  name: string;
  shortDescription: string;
  description: string;
  price: string;
  priceUnit: string;
  priceNote: string;
}

interface FeatureDraft {
  key: string;
  title: string;
  description: string;
  icon: string;
}

function emptyProduct(): ProductDraft {
  return { key: newKey(), name: "", shortDescription: "", description: "", price: "", priceUnit: "", priceNote: "" };
}

function emptyFeature(): FeatureDraft {
  return { key: newKey(), title: "", description: "", icon: "" };
}

function productToDraft(product: LandingProduct): ProductDraft {
  return {
    key: product.id,
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    price: product.price ?? "",
    priceUnit: product.priceUnit ?? "",
    priceNote: product.priceNote ?? "",
  };
}

function featureToDraft(feature: LandingFeature): FeatureDraft {
  return {
    key: feature.id,
    title: feature.title,
    description: feature.description,
    icon: feature.icon ?? "",
  };
}

export interface LandingPageFormInitialValues {
  businessName?: string;
  title?: string;
  slug?: string;
  heroTitle?: string;
  heroDescription?: string;
  description?: string;
  phone?: string;
  kakaoUrl?: string;
  address?: string;
  region?: string;
  industry?: string;
  representativePrice?: LandingPriceSummary;
  template?: LandingTemplateId;
  status?: LandingPageStatus;
  products?: LandingProduct[];
  features?: LandingFeature[];
}

const initialFormState: LandingPageFormState = { error: null };

/**
 * Shared by /admin/pages/new (mode="create") and /admin/pages/[id]/edit
 * (mode="edit"). `action` is the Server Action to bind the form to — the
 * edit page passes `updateLandingPageAction.bind(null, id)` so this
 * component never needs to know the difference beyond `mode` and
 * `initialValues`.
 */
export function LandingPageForm({
  mode,
  action,
  initialValues,
}: {
  mode: "create" | "edit";
  action: (state: LandingPageFormState, formData: FormData) => Promise<LandingPageFormState>;
  initialValues?: LandingPageFormInitialValues;
}) {
  const [state, formAction, pending] = useActionState(action, initialFormState);

  const [products, setProducts] = useState<ProductDraft[]>(() =>
    initialValues?.products && initialValues.products.length > 0
      ? initialValues.products.map(productToDraft)
      : [emptyProduct()]
  );
  const [features, setFeatures] = useState<FeatureDraft[]>(() =>
    initialValues?.features && initialValues.features.length > 0
      ? initialValues.features.map(featureToDraft)
      : [emptyFeature(), emptyFeature()]
  );
  const [template, setTemplate] = useState<LandingTemplateId>(initialValues?.template ?? "template-a");
  const [status, setStatus] = useState<LandingPageStatus>(initialValues?.status ?? "private");

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="template" value={template} readOnly />
      <input type="hidden" name="status" value={status} readOnly />

      {state.error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
          {state.error}
        </div>
      )}

      <FormSection title="기본 정보" description="랜딩페이지를 식별하는 기본 정보입니다.">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="업체명" required>
            <Input name="businessName" placeholder="예: 테크시큐리티" defaultValue={initialValues?.businessName} />
          </FormField>
          <FormField label="페이지 제목" required hint="브라우저 탭/검색결과에 노출되는 제목입니다.">
            <Input
              name="title"
              placeholder="예: 테크시큐리티 | 기업용 CCTV 설치 및 통합 보안 솔루션"
              defaultValue={initialValues?.title}
            />
          </FormField>
        </div>
        <FormField
          label="URL slug"
          required={mode === "create"}
          hint={mode === "edit" ? "URL은 생성 후 변경할 수 없습니다." : "예: cctv-company → hanalp.com/cctv-company"}
        >
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-sm text-slate-400">/</span>
            {mode === "edit" ? (
              <>
                <Input defaultValue={initialValues?.slug} disabled className="bg-slate-50 text-slate-500" />
                <input type="hidden" name="slug" defaultValue={initialValues?.slug} />
              </>
            ) : (
              <Input name="slug" placeholder="cctv-company" />
            )}
          </div>
        </FormField>
      </FormSection>

      <FormSection title="업체 소개" description="Hero 영역과 연락 정보를 입력합니다.">
        <FormField label="Hero 제목" required hint="페이지 최상단에 크게 표시되는 메인 카피입니다.">
          <Input
            name="heroTitle"
            placeholder="예: 기업용 CCTV 설치와 통합 보안, 한 번에 맡기세요"
            defaultValue={initialValues?.heroTitle}
          />
        </FormField>
        <FormField label="Hero 설명" hint="메인 카피를 보조하는 한두 문장입니다.">
          <Textarea
            name="heroDescription"
            rows={2}
            placeholder="예: 설계부터 시공, 유지보수까지 15년 경력의 보안 전문 엔지니어가 함께합니다."
            defaultValue={initialValues?.heroDescription}
          />
        </FormField>
        <FormField
          label="소개 문구"
          hint="회사 소개 섹션에 노출되는 본문입니다. 충분히 작성할수록 SEO/AEO/GEO에 유리합니다."
        >
          <Textarea
            name="description"
            rows={4}
            placeholder="업체의 연혁, 강점, 전문 분야 등을 자유롭게 작성하세요."
            defaultValue={initialValues?.description}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="전화번호">
            <Input name="phone" placeholder="1588-0000" defaultValue={initialValues?.phone} />
          </FormField>
          <FormField label="카카오톡 채널 URL">
            <Input name="kakaoUrl" placeholder="https://pf.kakao.com/_xxxxx" defaultValue={initialValues?.kakaoUrl} />
          </FormField>
        </div>
        <FormField label="주소">
          <Input name="address" placeholder="서울특별시 강남구 테헤란로 123" defaultValue={initialValues?.address} />
        </FormField>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="지역" hint="GEO — 검색/AI가 서비스 지역을 파악하는 데 쓰입니다.">
            <Input name="region" placeholder="서울 강남구" defaultValue={initialValues?.region} />
          </FormField>
          <FormField label="업종" hint="GEO — 업종을 짧은 문구로 설명해주세요.">
            <Input name="industry" placeholder="CCTV 설치 및 통합 보안 솔루션" defaultValue={initialValues?.industry} />
          </FormField>
        </div>
      </FormSection>

      <FormSection
        title="제품 / 서비스"
        description="하나의 랜딩페이지에 여러 제품 또는 서비스를 등록할 수 있습니다. 이름이 비어있는 항목은 저장되지 않습니다."
      >
        <div className="space-y-5">
          {products.map((product, index) => (
            <div key={product.key} className="rounded-lg border border-slate-200 p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">제품/서비스 #{index + 1}</p>
                {products.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setProducts((prev) => prev.filter((p) => p.key !== product.key))}
                    className="text-xs font-medium text-rose-600 hover:text-rose-700"
                  >
                    삭제
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField label="서비스명">
                  <Input
                    name={`products[${index}].name`}
                    placeholder="예: 4K CCTV 설치"
                    defaultValue={product.name}
                  />
                </FormField>
                <FormField label="짧은 설명" hint="목록/카드에 노출되는 한 줄 요약">
                  <Input
                    name={`products[${index}].shortDescription`}
                    placeholder="예: 실내외 전 구역을 선명하게 기록하는 4K UHD 카메라 설치"
                    defaultValue={product.shortDescription}
                  />
                </FormField>
              </div>
              <FormField label="상세 설명" hint="검색엔진이 읽을 수 있는 실제 본문 텍스트입니다. 충분히 작성해 주세요.">
                <Textarea
                  name={`products[${index}].description`}
                  rows={3}
                  placeholder="서비스에 대한 상세 설명을 입력하세요."
                  defaultValue={product.description}
                />
              </FormField>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <FormField label="가격">
                  <Input name={`products[${index}].price`} placeholder="158만원" defaultValue={product.price} />
                </FormField>
                <FormField label="가격 단위">
                  <Input
                    name={`products[${index}].priceUnit`}
                    placeholder="부터 / 월 / 회당"
                    defaultValue={product.priceUnit}
                  />
                </FormField>
                <FormField label="가격 설명">
                  <Input
                    name={`products[${index}].priceNote`}
                    placeholder="카메라 4대 기준"
                    defaultValue={product.priceNote}
                  />
                </FormField>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setProducts((prev) => [...prev, emptyProduct()])}
          className="w-full rounded-lg border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-500 transition hover:border-blue-400 hover:text-blue-600"
        >
          + 제품/서비스 추가
        </button>
      </FormSection>

      <FormSection
        title="가격"
        description="개별 상품 가격과 별개로, Hero/가격 섹션에 노출할 대표 가격을 설정할 수 있습니다."
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <FormField label="대표 가격 라벨">
            <Input
              name="priceLabel"
              placeholder="대표 설치 비용"
              defaultValue={initialValues?.representativePrice?.label}
            />
          </FormField>
          <FormField label="대표 가격">
            <Input
              name="price"
              placeholder="158만원부터 / 월 49,000원 / 1588-0000 상담"
              defaultValue={initialValues?.representativePrice?.price}
            />
          </FormField>
          <FormField label="가격 단위">
            <Input
              name="priceUnit"
              placeholder="부터 / VAT 별도"
              defaultValue={initialValues?.representativePrice?.priceUnit}
            />
          </FormField>
        </div>
        <FormField label="가격 설명" hint="가격에 조건이 있다면 함께 설명해 주세요. 가격 정보가 없는 업체는 비워두어도 됩니다.">
          <Textarea
            name="priceDescription"
            rows={2}
            placeholder="설치 환경에 따라 별도 견적이 제공됩니다."
            defaultValue={initialValues?.representativePrice?.description}
          />
        </FormField>
      </FormSection>

      <FormSection
        title="핵심 특징"
        description="차별점이나 강점을 카드 형태로 보여줍니다. 제목이 비어있는 항목은 저장되지 않습니다."
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {features.map((feature, index) => (
            <div key={feature.key} className="rounded-lg border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500">특징 #{index + 1}</p>
                {features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setFeatures((prev) => prev.filter((f) => f.key !== feature.key))}
                    className="text-xs font-medium text-rose-600 hover:text-rose-700"
                  >
                    삭제
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <Input
                  name={`features[${index}].title`}
                  placeholder="제목 (예: 4K UHD)"
                  defaultValue={feature.title}
                />
                <Textarea
                  name={`features[${index}].description`}
                  rows={2}
                  placeholder="설명"
                  defaultValue={feature.description}
                />
                <Input
                  name={`features[${index}].icon`}
                  placeholder="아이콘(선택, 이모지) 예: 🎥"
                  defaultValue={feature.icon}
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setFeatures((prev) => [...prev, emptyFeature()])}
          className="w-full rounded-lg border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-500 transition hover:border-blue-400 hover:text-blue-600"
        >
          + 특징 추가
        </button>
      </FormSection>

      <FormSection title="이미지" description="Hero 및 제품 이미지를 등록합니다.">
        <div className="flex items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
          <div>
            <p className="text-sm font-medium text-slate-500">이미지 업로드</p>
            <p className="mt-1 text-xs text-slate-400">
              Storage 연동 전 단계입니다. 8단계에서 Supabase Storage와 연결될 예정입니다.
            </p>
          </div>
        </div>
      </FormSection>

      <FormSection title="템플릿 선택" description="업종과 목적에 맞는 템플릿을 선택하세요.">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTemplate(t.id)}
              className={cn(
                "overflow-hidden rounded-xl border-2 text-left transition",
                template === t.id ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200 hover:border-slate-300"
              )}
            >
              <MiniTemplatePreview templateId={t.id} />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                  {template === t.id && (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                      선택됨
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">{t.nameEn}</p>
              </div>
            </button>
          ))}
        </div>
      </FormSection>

      <FormSection title="공개 상태" description="페이지를 바로 공개할지, 초안으로 저장할지 선택합니다.">
        <FormField label="공개 상태">
          <Select value={status} onChange={(e) => setStatus(e.target.value as LandingPageStatus)}>
            <option value="private">비공개 (초안)</option>
            <option value="public">공개</option>
          </Select>
        </FormField>
      </FormSection>

      <div className="flex items-center justify-end gap-3 pb-4">
        <Link
          href="/admin/pages"
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          취소
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "저장 중..." : mode === "create" ? "랜딩페이지 생성" : "변경사항 저장"}
        </button>
      </div>
    </form>
  );
}
