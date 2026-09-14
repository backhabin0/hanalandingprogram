"use client";

import { useState } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { FormField, FormSection } from "@/components/admin/FormField";
import { Input, Select, Textarea } from "@/components/admin/FormControls";
import { MiniTemplatePreview } from "@/components/admin/MiniTemplatePreview";
import { cn } from "@/lib/utils";
import { templates } from "@/lib/mock-data";
import type { LandingPageStatus, LandingTemplateId } from "@/types/landing";

type DraftRow = { id: string };

function newRow(): DraftRow {
  return { id: typeof crypto !== "undefined" ? crypto.randomUUID() : `${Date.now()}-${Math.random()}` };
}

export default function NewLandingPagePage() {
  const [products, setProducts] = useState<DraftRow[]>([newRow()]);
  const [features, setFeatures] = useState<DraftRow[]>([newRow(), newRow()]);
  const [template, setTemplate] = useState<LandingTemplateId>("template-a");
  const [status, setStatus] = useState<LandingPageStatus>("private");

  return (
    <div>
      <PageHeader
        title="새 랜딩페이지 만들기"
        description="정보를 입력해 랜딩페이지를 구성하세요. 이 단계에서는 실제로 저장되지 않는 UI 프로토타입입니다."
      />

      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        ⚠️ Stage 1 UI 프로토타입입니다. 입력한 내용은 저장되지 않으며, DB 연동은 다음 단계에서 진행됩니다.
      </div>

      <form
        className="space-y-6"
        onSubmit={(e) => e.preventDefault()}
      >
        <FormSection title="기본 정보" description="랜딩페이지를 식별하는 기본 정보입니다.">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField label="업체명" required>
              <Input name="businessName" placeholder="예: 테크시큐리티" />
            </FormField>
            <FormField label="페이지 제목" required hint="브라우저 탭/검색결과에 노출되는 제목입니다.">
              <Input name="title" placeholder="예: 테크시큐리티 | 기업용 CCTV 설치 및 통합 보안 솔루션" />
            </FormField>
          </div>
          <FormField label="URL slug" required hint="예: cctv-company → hanalp.com/cctv-company">
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-sm text-slate-400">/</span>
              <Input name="slug" placeholder="cctv-company" />
            </div>
          </FormField>
        </FormSection>

        <FormSection title="업체 소개" description="Hero 영역과 연락 정보를 입력합니다.">
          <FormField label="Hero 제목" required hint="페이지 최상단에 크게 표시되는 메인 카피입니다.">
            <Input name="heroTitle" placeholder="예: 기업용 CCTV 설치와 통합 보안, 한 번에 맡기세요" />
          </FormField>
          <FormField label="Hero 설명" hint="메인 카피를 보조하는 한두 문장입니다.">
            <Textarea name="heroDescription" rows={2} placeholder="예: 설계부터 시공, 유지보수까지 15년 경력의 보안 전문 엔지니어가 함께합니다." />
          </FormField>
          <FormField
            label="소개 문구"
            hint="회사 소개 섹션에 노출되는 본문입니다. 충분히 작성할수록 SEO/AEO/GEO에 유리합니다."
          >
            <Textarea name="description" rows={4} placeholder="업체의 연혁, 강점, 전문 분야 등을 자유롭게 작성하세요." />
          </FormField>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField label="전화번호">
              <Input name="phone" placeholder="1588-0000" />
            </FormField>
            <FormField label="카카오톡 채널 URL">
              <Input name="kakaoUrl" placeholder="https://pf.kakao.com/_xxxxx" />
            </FormField>
          </div>
          <FormField label="주소">
            <Input name="address" placeholder="서울특별시 강남구 테헤란로 123" />
          </FormField>
        </FormSection>

        <FormSection
          title="제품 / 서비스"
          description="하나의 랜딩페이지에 여러 제품 또는 서비스를 등록할 수 있습니다."
        >
          <div className="space-y-5">
            {products.map((product, index) => (
              <div key={product.id} className="rounded-lg border border-slate-200 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">제품/서비스 #{index + 1}</p>
                  {products.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setProducts((prev) => prev.filter((p) => p.id !== product.id))}
                      className="text-xs font-medium text-rose-600 hover:text-rose-700"
                    >
                      삭제
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField label="서비스명" required>
                    <Input placeholder="예: 4K CCTV 설치" />
                  </FormField>
                  <FormField label="짧은 설명" hint="목록/카드에 노출되는 한 줄 요약">
                    <Input placeholder="예: 실내외 전 구역을 선명하게 기록하는 4K UHD 카메라 설치" />
                  </FormField>
                </div>
                <FormField
                  label="상세 설명"
                  hint="검색엔진이 읽을 수 있는 실제 본문 텍스트입니다. 충분히 작성해 주세요."
                >
                  <Textarea rows={3} placeholder="서비스에 대한 상세 설명을 입력하세요." />
                </FormField>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <FormField label="가격">
                    <Input placeholder="158만원" />
                  </FormField>
                  <FormField label="가격 단위">
                    <Input placeholder="부터 / 월 / 회당" />
                  </FormField>
                  <FormField label="가격 설명">
                    <Input placeholder="카메라 4대 기준" />
                  </FormField>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setProducts((prev) => [...prev, newRow()])}
            className="w-full rounded-lg border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-500 transition hover:border-blue-400 hover:text-blue-600"
          >
            + 제품/서비스 추가
          </button>
        </FormSection>

        <FormSection
          title="가격"
          description="개별 상품 가격과 별개로, Hero/가격 섹션에 노출할 대표 가격을 설정할 수 있습니다."
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField label="대표 가격 라벨">
              <Input placeholder="대표 설치 비용" />
            </FormField>
            <FormField label="대표 가격">
              <Input placeholder="158만원부터 / 월 49,000원 / 1588-0000 상담" />
            </FormField>
          </div>
          <FormField label="가격 설명" hint="가격에 조건이 있다면 함께 설명해 주세요. 가격 정보가 없는 업체는 비워두어도 됩니다.">
            <Textarea rows={2} placeholder="설치 환경에 따라 별도 견적이 제공됩니다." />
          </FormField>
        </FormSection>

        <FormSection title="핵심 특징" description="차별점이나 강점을 카드 형태로 보여줍니다.">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {features.map((feature, index) => (
              <div key={feature.id} className="rounded-lg border border-slate-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500">특징 #{index + 1}</p>
                  {features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setFeatures((prev) => prev.filter((f) => f.id !== feature.id))}
                      className="text-xs font-medium text-rose-600 hover:text-rose-700"
                    >
                      삭제
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <Input placeholder="제목 (예: 4K UHD)" />
                  <Textarea rows={2} placeholder="설명" />
                  <Input placeholder="아이콘(선택, 이모지) 예: 🎥" />
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setFeatures((prev) => [...prev, newRow()])}
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
                Storage 연동 전 단계입니다. 2단계에서 Supabase Storage와 연결될 예정입니다.
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
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            취소
          </button>
          <button
            type="submit"
            title="Stage 1에서는 저장이 비활성화되어 있습니다."
            className="cursor-not-allowed rounded-lg bg-blue-600/50 px-5 py-2.5 text-sm font-semibold text-white"
          >
            저장하기 (2단계에서 활성화)
          </button>
        </div>
      </form>
    </div>
  );
}
