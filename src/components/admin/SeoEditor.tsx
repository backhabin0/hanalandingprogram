"use client";

import { useActionState, useState } from "react";
import { FormField, FormSection } from "@/components/admin/FormField";
import { Input, Textarea } from "@/components/admin/FormControls";
import { EditorSaveBar } from "@/components/admin/EditorControls";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import type { LandingSeoMeta } from "@/types/landing";
import { saveLandingSeoSettingsAction, type SeoSettingsFormState } from "@/app/admin/pages/[id]/edit/actions";
import { removeOgImageAction, uploadOgImageAction } from "@/app/admin/pages/[id]/edit/image-actions";

interface SeoDraft {
  seoTitle: string;
  seoDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  seoNoindex: boolean;
  businessCategory: string;
  serviceArea: string;
  primaryKeyword: string;
  secondaryKeywords: string;
  localityDescription: string;
}

function toDraft(seo: LandingSeoMeta | undefined): SeoDraft {
  return {
    seoTitle: seo?.metaTitle ?? "",
    seoDescription: seo?.metaDescription ?? "",
    ogTitle: seo?.ogTitle ?? "",
    ogDescription: seo?.ogDescription ?? "",
    ogImageUrl: seo?.ogImageUrl ?? "",
    seoNoindex: seo?.noindex ?? false,
    businessCategory: seo?.businessCategory ?? "",
    serviceArea: seo?.serviceArea ?? "",
    primaryKeyword: seo?.primaryKeyword ?? "",
    secondaryKeywords: (seo?.secondaryKeywords ?? []).join(", "),
    localityDescription: seo?.localityDescription ?? "",
  };
}

const initialState: SeoSettingsFormState = { error: null };

function AutoBadge({ isManual }: { isManual: boolean }) {
  return (
    <span
      className={
        isManual
          ? "rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700"
          : "rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500"
      }
    >
      {isManual ? "직접 설정" : "자동"}
    </span>
  );
}

export function SeoEditor({
  landingPageId,
  initialSeo,
  autoTitle,
  autoDescription,
}: {
  landingPageId: string;
  initialSeo: LandingSeoMeta | undefined;
  /** Always the auto-generated candidate, ignoring any manual override — see resolveLandingPageSeo. */
  autoTitle: string;
  autoDescription: string;
}) {
  const boundAction = saveLandingSeoSettingsAction.bind(null, landingPageId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const [form, setForm] = useState<SeoDraft>(() => toDraft(initialSeo));

  // Same fix as every other editor's ActiveToggle (see ProductsEditor):
  // native form reset after the action settles can leave a controlled
  // checkbox visually stale even though state/DB are correct. Remounting on
  // every successful save forces a fresh DOM write.
  const [syncedSeo, setSyncedSeo] = useState(state.seo);
  const [syncTick, setSyncTick] = useState(0);
  if (state.seo !== syncedSeo) {
    setSyncedSeo(state.seo);
    if (state.seo) setForm(toDraft(state.seo));
    setSyncTick((t) => t + 1);
  }

  function update(patch: Partial<SeoDraft>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  return (
    <form action={formAction}>
      <FormSection
        title="SEO / 검색 · AI 노출"
        description="비워두면 업체명·지역·업종 등 기존 정보로 자동 생성됩니다. 직접 입력하면 그 값이 항상 우선합니다."
      >
        <FormField label="SEO 제목" hint="비워두면 자동 생성됩니다.">
          <div className="mb-1.5 flex items-center gap-2">
            <AutoBadge isManual={Boolean(form.seoTitle)} />
          </div>
          <Input
            name="seoTitle"
            placeholder={autoTitle}
            value={form.seoTitle}
            onChange={(e) => update({ seoTitle: e.target.value })}
          />
          <p className="mt-1.5 text-xs text-slate-400">현재 자동값: {autoTitle}</p>
        </FormField>

        <FormField label="SEO 설명" hint="비워두면 자동 생성됩니다.">
          <div className="mb-1.5 flex items-center gap-2">
            <AutoBadge isManual={Boolean(form.seoDescription)} />
          </div>
          <Textarea
            name="seoDescription"
            rows={2}
            placeholder={autoDescription}
            value={form.seoDescription}
            onChange={(e) => update({ seoDescription: e.target.value })}
          />
          <p className="mt-1.5 text-xs text-slate-400">현재 자동값: {autoDescription}</p>
        </FormField>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="OG 제목" hint="비워두면 SEO 제목(또는 자동값)을 사용합니다.">
            <Input name="ogTitle" value={form.ogTitle} onChange={(e) => update({ ogTitle: e.target.value })} />
          </FormField>
          <FormField label="OG 설명" hint="비워두면 SEO 설명(또는 자동값)을 사용합니다.">
            <Input
              name="ogDescription"
              value={form.ogDescription}
              onChange={(e) => update({ ogDescription: e.target.value })}
            />
          </FormField>
        </div>

        <ImageUploadField
          label="OG 이미지"
          hint="1200 x 630 권장 — 카카오톡/소셜/검색 공유 시 노출되는 썸네일입니다. Hero 이미지와는 목적이 다릅니다."
          ratio="aspect-[1200/630]"
          currentUrl={form.ogImageUrl || undefined}
          altText="OG 공유 이미지"
          uploadAction={(formData) => uploadOgImageAction(landingPageId, formData)}
          removeAction={() => removeOgImageAction(landingPageId)}
          onChange={(url) => update({ ogImageUrl: url ?? "" })}
        />
        <FormField label="OG 이미지 URL" hint="외부 이미지 URL을 직접 입력할 수도 있습니다.">
          <Input
            name="ogImageUrl"
            type="url"
            placeholder="https://example.com/og-image.jpg"
            value={form.ogImageUrl}
            onChange={(e) => update({ ogImageUrl: e.target.value })}
          />
        </FormField>

        <label key={`noindex-${syncTick}`} className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            name="seoNoindex"
            checked={form.seoNoindex}
            onChange={(e) => update({ seoNoindex: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30"
          />
          검색엔진 노출 차단 (noindex) — 페이지는 정상 접속되지만 검색결과에는 노출되지 않습니다.
        </label>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="대표 업종" hint="비워두면 업체 기본 정보의 업종을 사용합니다.">
            <Input
              name="businessCategory"
              placeholder="예: 사무기기 렌탈"
              value={form.businessCategory}
              onChange={(e) => update({ businessCategory: e.target.value })}
            />
          </FormField>
          <FormField label="서비스 지역" hint="실제 서비스 제공 지역을 자연스러운 문장으로 입력하세요.">
            <Input
              name="serviceArea"
              placeholder="예: 전주시 덕진구·완산구"
              value={form.serviceArea}
              onChange={(e) => update({ serviceArea: e.target.value })}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="대표 검색어" hint="관리자 콘텐츠 작성 가이드용입니다. meta keywords 태그로 출력되지 않습니다.">
            <Input
              name="primaryKeyword"
              placeholder="예: 전주 복사기 임대"
              value={form.primaryKeyword}
              onChange={(e) => update({ primaryKeyword: e.target.value })}
            />
          </FormField>
          <FormField label="보조 검색어" hint="쉼표로 구분해 입력하세요. 최대 10개.">
            <Input
              name="secondaryKeywords"
              placeholder="전주 복합기 렌탈, 전주 복사기 설치"
              value={form.secondaryKeywords}
              onChange={(e) => update({ secondaryKeywords: e.target.value })}
            />
          </FormField>
        </div>

        <FormField
          label="지역 설명"
          hint="실제 서비스 지역을 설명하는 문장입니다. 페이지 본문에도 자연스럽게 노출됩니다."
        >
          <Textarea
            name="localityDescription"
            rows={2}
            placeholder="예: 전주시 덕진구·완산구의 사무실, 학원, 병원 등을 대상으로 서비스합니다."
            value={form.localityDescription}
            onChange={(e) => update({ localityDescription: e.target.value })}
          />
        </FormField>

        <EditorSaveBar pending={pending} error={state.error} saved={!pending && state !== initialState && !state.error} />
      </FormSection>
    </form>
  );
}
