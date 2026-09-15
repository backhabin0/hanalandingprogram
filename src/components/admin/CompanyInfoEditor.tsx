"use client";

import { useState } from "react";
import { useActionState } from "react";
import { FormField, FormSection } from "@/components/admin/FormField";
import { Input, Textarea } from "@/components/admin/FormControls";
import { EditorSaveBar } from "@/components/admin/EditorControls";
import type { LandingCompanyInfo } from "@/types/landing";
import { saveLandingCompanyInfoAction, type CompanyInfoFormState } from "@/app/admin/pages/[id]/edit/actions";

interface CompanyInfoDraft {
  companyName: string;
  representative: string;
  businessNumber: string;
  establishedYear: string;
  email: string;
  customerCenter: string;
  businessHours: string;
  address: string;
  footerDescription: string;
}

function toDraft(info: LandingCompanyInfo | undefined): CompanyInfoDraft {
  return {
    companyName: info?.companyName ?? "",
    representative: info?.representative ?? "",
    businessNumber: info?.businessRegistrationNumber ?? "",
    establishedYear: info?.establishedYear ?? "",
    email: info?.email ?? "",
    customerCenter: info?.customerCenter ?? "",
    businessHours: info?.businessHours ?? "",
    address: info?.address ?? "",
    footerDescription: info?.footerDescription ?? "",
  };
}

const initialState: CompanyInfoFormState = { error: null };

export function CompanyInfoEditor({
  landingPageId,
  initialCompanyInfo,
}: {
  landingPageId: string;
  initialCompanyInfo: LandingCompanyInfo | undefined;
}) {
  const boundAction = saveLandingCompanyInfoAction.bind(null, landingPageId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const [form, setForm] = useState<CompanyInfoDraft>(() => toDraft(initialCompanyInfo));

  // Controlled fields (not defaultValue): a <form action> resets uncontrolled
  // inputs once the action settles, which would wipe a validation-error
  // submission's just-typed values.
  const [syncedCompanyInfo, setSyncedCompanyInfo] = useState(state.companyInfo);
  if (state.companyInfo !== syncedCompanyInfo) {
    setSyncedCompanyInfo(state.companyInfo);
    if (state.companyInfo) setForm(toDraft(state.companyInfo));
  }

  function update(patch: Partial<CompanyInfoDraft>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  return (
    <form action={formAction}>
      <FormSection
        title="회사 정보"
        description="Footer/오시는 길에 표시되는 사업자·법적 정보입니다. 값이 없는 항목은 공개 페이지에 표시되지 않습니다."
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="회사명" hint="비워두면 업체명을 그대로 사용합니다.">
            <Input
              name="companyName"
              placeholder="예: 테크시큐리티 주식회사"
              value={form.companyName}
              onChange={(e) => update({ companyName: e.target.value })}
            />
          </FormField>
          <FormField label="대표자명">
            <Input
              name="representative"
              placeholder="예: 김보안"
              value={form.representative}
              onChange={(e) => update({ representative: e.target.value })}
            />
          </FormField>
          <FormField label="사업자등록번호">
            <Input
              name="businessNumber"
              placeholder="123-45-67890"
              value={form.businessNumber}
              onChange={(e) => update({ businessNumber: e.target.value })}
            />
          </FormField>
          <FormField label="설립연도">
            <Input
              name="establishedYear"
              placeholder="2009"
              value={form.establishedYear}
              onChange={(e) => update({ establishedYear: e.target.value })}
            />
          </FormField>
          <FormField label="이메일">
            <Input
              name="email"
              type="email"
              placeholder="contact@example.com"
              value={form.email}
              onChange={(e) => update({ email: e.target.value })}
            />
          </FormField>
          <FormField label="고객센터">
            <Input
              name="customerCenter"
              placeholder="1588-0000"
              value={form.customerCenter}
              onChange={(e) => update({ customerCenter: e.target.value })}
            />
          </FormField>
          <FormField label="영업시간">
            <Input
              name="businessHours"
              placeholder="평일 09:00 - 18:00"
              value={form.businessHours}
              onChange={(e) => update({ businessHours: e.target.value })}
            />
          </FormField>
          <FormField label="상세 주소" hint="Hero/오시는 길의 주소와 별개로, 법적 소재지가 다르면 입력하세요.">
            <Input
              name="address"
              placeholder="서울특별시 강남구 테헤란로 123, 4층"
              value={form.address}
              onChange={(e) => update({ address: e.target.value })}
            />
          </FormField>
        </div>
        <FormField label="푸터 설명" hint="Footer에 노출되는 회사 소개 문구입니다.">
          <Textarea
            name="footerDescription"
            rows={3}
            placeholder="회사 소개, 연혁, 강점 등을 자유롭게 작성하세요."
            value={form.footerDescription}
            onChange={(e) => update({ footerDescription: e.target.value })}
          />
        </FormField>

        <EditorSaveBar pending={pending} error={state.error} saved={!pending && state !== initialState && !state.error} />
      </FormSection>
    </form>
  );
}
