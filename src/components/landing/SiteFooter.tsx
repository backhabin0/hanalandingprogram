"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { LandingCompanyInfo } from "@/types/landing";
import type { LandingVariant } from "./SiteHeader";

const VARIANT_FOOTER: Record<LandingVariant, string> = {
  a: "border-white/10 bg-slate-950 text-slate-400",
  b: "border-white/10 bg-black text-slate-400",
  c: "border-stone-800 bg-stone-900 text-stone-400",
};

const VARIANT_HEADING: Record<LandingVariant, string> = {
  a: "text-slate-500",
  b: "text-amber-500/70",
  c: "text-stone-500",
};

const VARIANT_LINK_HOVER: Record<LandingVariant, string> = {
  a: "hover:text-white",
  b: "hover:text-amber-300",
  c: "hover:text-orange-300",
};

const VARIANT_MARK: Record<LandingVariant, string> = {
  a: "rounded-lg bg-blue-600",
  b: "rounded-lg bg-amber-400 text-slate-950",
  c: "rounded-full bg-orange-600",
};

const VARIANT_MARK_SHAPE: Record<LandingVariant, string> = {
  a: "rounded-lg",
  b: "rounded-lg",
  c: "rounded-full",
};

export function SiteFooter({
  businessName,
  logoUrl,
  industry,
  phone,
  address,
  navItems,
  companyInfo,
  variant,
}: {
  businessName: string;
  logoUrl?: string;
  industry?: string;
  phone?: string;
  address?: string;
  /** Same anchors shown in SiteHeader — keeps quick links honest about which sections actually exist on this page. */
  navItems?: { label: string; href: string }[];
  companyInfo?: LandingCompanyInfo;
  variant: LandingVariant;
}) {
  const displayName = companyInfo?.companyName ?? businessName;
  // Falls back to the letter mark — never a broken-image icon — if `logoUrl`
  // fails to load, same pattern as ImagePlaceholder / SiteHeader.
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <footer className={cn("border-t", VARIANT_FOOTER[variant])}>
      <div className="mx-auto max-w-[1360px] px-6 py-16 lg:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              {logoUrl && !logoFailed ? (
                // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-supplied/Storage URL, no fixed remotePatterns host set for this stage
                <img
                  src={logoUrl}
                  alt={displayName}
                  className={cn("h-8 w-8 shrink-0 object-cover", VARIANT_MARK_SHAPE[variant])}
                  onError={() => setLogoFailed(true)}
                />
              ) : (
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center text-sm font-bold text-white",
                    VARIANT_MARK[variant]
                  )}
                >
                  {displayName.slice(0, 1)}
                </span>
              )}
              <span className="text-base font-bold text-white">{displayName}</span>
            </div>
            {industry && <p className="mt-4 max-w-xs text-sm leading-relaxed">{industry}</p>}
            {companyInfo?.footerDescription && (
              <p className="mt-3 max-w-xs whitespace-pre-line text-sm leading-relaxed">
                {companyInfo.footerDescription}
              </p>
            )}
          </div>

          {navItems && navItems.length > 0 && (
            <div>
              <h3 className={cn("text-xs font-semibold uppercase tracking-wide", VARIANT_HEADING[variant])}>
                바로가기
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className={VARIANT_LINK_HOVER[variant]}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className={cn("text-xs font-semibold uppercase tracking-wide", VARIANT_HEADING[variant])}>
              사업자 정보
            </h3>
            <dl className="mt-4 space-y-1.5 text-sm leading-relaxed">
              {companyInfo?.representative && (
                <div className="flex gap-2">
                  <dt className="shrink-0">대표</dt>
                  <dd>{companyInfo.representative}</dd>
                </div>
              )}
              {companyInfo?.businessRegistrationNumber && (
                <div className="flex gap-2">
                  <dt className="shrink-0">사업자등록번호</dt>
                  <dd>{companyInfo.businessRegistrationNumber}</dd>
                </div>
              )}
              {(address ?? companyInfo?.address) && (
                <div className="flex gap-2">
                  <dt className="shrink-0">주소</dt>
                  <dd>{address ?? companyInfo?.address}</dd>
                </div>
              )}
              {phone && (
                <div className="flex gap-2">
                  <dt className="shrink-0">대표전화</dt>
                  <dd>{phone}</dd>
                </div>
              )}
              {companyInfo?.customerCenter && (
                <div className="flex gap-2">
                  <dt className="shrink-0">고객센터</dt>
                  <dd>{companyInfo.customerCenter}</dd>
                </div>
              )}
              {companyInfo?.businessHours && (
                <div className="flex gap-2">
                  <dt className="shrink-0">영업시간</dt>
                  <dd>{companyInfo.businessHours}</dd>
                </div>
              )}
              {companyInfo?.email && (
                <div className="flex gap-2">
                  <dt className="shrink-0">이메일</dt>
                  <dd>{companyInfo.email}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {displayName}. All rights reserved.</p>
          {companyInfo?.establishedYear && <p>설립 {companyInfo.establishedYear}년</p>}
        </div>
      </div>
    </footer>
  );
}
