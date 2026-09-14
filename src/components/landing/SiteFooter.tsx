import { cn } from "@/lib/utils";
import type { LandingCompanyInfo } from "@/types/landing";
import type { LandingVariant } from "./SiteHeader";

const VARIANT_MARK: Record<LandingVariant, string> = {
  a: "bg-blue-600",
  b: "bg-amber-400 text-slate-950",
  c: "bg-orange-600",
};

export function SiteFooter({
  businessName,
  industry,
  phone,
  address,
  companyInfo,
  variant,
}: {
  businessName: string;
  industry?: string;
  phone?: string;
  address?: string;
  companyInfo?: LandingCompanyInfo;
  variant: LandingVariant;
}) {
  return (
    <footer className="border-t border-white/10 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-[1360px] px-6 py-16 lg:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white",
                  VARIANT_MARK[variant]
                )}
              >
                {businessName.slice(0, 1)}
              </span>
              <span className="text-base font-bold text-white">{businessName}</span>
            </div>
            {industry && <p className="mt-4 max-w-xs text-sm leading-relaxed">{industry}</p>}
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">바로가기</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#products" className="hover:text-white">서비스 소개</a></li>
              <li><a href="#pricing" className="hover:text-white">가격 안내</a></li>
              <li><a href="#faq" className="hover:text-white">자주 묻는 질문</a></li>
              <li><a href="#lead" className="hover:text-white">상담 신청</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">사업자 정보</h3>
            <dl className="mt-4 space-y-1.5 text-sm leading-relaxed">
              {companyInfo?.representative && (
                <div className="flex gap-2">
                  <dt className="text-slate-500">대표</dt>
                  <dd>{companyInfo.representative}</dd>
                </div>
              )}
              {companyInfo?.businessRegistrationNumber && (
                <div className="flex gap-2">
                  <dt className="text-slate-500">사업자등록번호</dt>
                  <dd>{companyInfo.businessRegistrationNumber}</dd>
                </div>
              )}
              {(address ?? companyInfo?.address) && (
                <div className="flex gap-2">
                  <dt className="shrink-0 text-slate-500">주소</dt>
                  <dd>{address ?? companyInfo?.address}</dd>
                </div>
              )}
              {phone && (
                <div className="flex gap-2">
                  <dt className="text-slate-500">대표전화</dt>
                  <dd>{phone}</dd>
                </div>
              )}
              {companyInfo?.email && (
                <div className="flex gap-2">
                  <dt className="text-slate-500">이메일</dt>
                  <dd>{companyInfo.email}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {businessName}. All rights reserved.</p>
          {companyInfo?.establishedYear && <p>설립 {companyInfo.establishedYear}년</p>}
        </div>
      </div>
    </footer>
  );
}
