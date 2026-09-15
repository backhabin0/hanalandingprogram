import { cn, toTelHref } from "@/lib/utils";
import type { LandingVariant } from "./SiteHeader";

const VARIANT_SECTION: Record<LandingVariant, string> = {
  a: "bg-blue-700",
  b: "bg-amber-400",
  c: "bg-orange-600",
};

const VARIANT_TEXT: Record<LandingVariant, string> = {
  a: "text-blue-50",
  b: "text-slate-950",
  c: "text-orange-50",
};

const VARIANT_TITLE: Record<LandingVariant, string> = {
  a: "text-white",
  b: "text-slate-950",
  c: "text-white",
};

const VARIANT_CTA: Record<LandingVariant, string> = {
  a: "bg-white text-blue-700 hover:bg-blue-50",
  b: "bg-slate-950 text-amber-300 hover:bg-slate-900",
  c: "bg-white text-orange-700 hover:bg-orange-50",
};

const fieldClass =
  "block w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-offset-1";

export function LeadSection({
  id = "lead",
  title,
  description,
  phone,
  kakaoUrl,
  variant,
}: {
  id?: string;
  title: string;
  description?: string;
  phone?: string;
  kakaoUrl?: string;
  variant: LandingVariant;
}) {
  return (
    <section id={id} className={VARIANT_SECTION[variant]}>
      <div className="mx-auto grid max-w-[1360px] items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:px-10">
        <div>
          <h2 className={cn("text-3xl font-bold tracking-tight sm:text-4xl", VARIANT_TITLE[variant])}>
            {title}
          </h2>
          {description && (
            <p className={cn("mt-4 max-w-md text-base leading-relaxed", VARIANT_TEXT[variant])}>
              {description}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {phone && (
              <a
                href={toTelHref(phone)}
                className={cn(
                  "rounded-lg px-5 py-3 text-sm font-semibold shadow-sm transition",
                  VARIANT_CTA[variant]
                )}
              >
                전화 문의 {phone}
              </a>
            )}
            {kakaoUrl && (
              <a
                href={kakaoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                카카오톡 문의
              </a>
            )}
          </div>
        </div>

        <form className="rounded-xl bg-white p-7 shadow-xl sm:p-8">
          <h3 className="text-base font-semibold text-slate-900">빠른 상담 신청</h3>
          <p className="mt-1 text-sm text-slate-500">담당자가 확인 후 순차적으로 연락드립니다.</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor={`${id}-name`}>
                이름
              </label>
              <input id={`${id}-name`} type="text" placeholder="홍길동" className={fieldClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor={`${id}-phone`}>
                연락처
              </label>
              <input id={`${id}-phone`} type="tel" placeholder="010-0000-0000" className={fieldClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor={`${id}-message`}>
                문의 내용
              </label>
              <textarea
                id={`${id}-message`}
                rows={3}
                placeholder="문의하실 내용을 간단히 남겨주세요."
                className={cn(fieldClass, "resize-none")}
              />
            </div>
            <button
              type="button"
              className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              상담 신청하기
            </button>
            <p className="text-center text-xs text-slate-400">
              ※ 상담 폼 미리보기입니다 — 실제 접수 기능은 이후 단계에서 연결됩니다.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
