import { cn, toTelHref } from "@/lib/utils";
import type { LandingVariant } from "./SiteHeader";
import type { InquiryType, LandingProduct } from "@/types/landing";
import { ConsultationForm } from "./ConsultationForm";
import { TrackedLink } from "@/components/analytics/TrackedLink";

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

export function LeadSection({
  id = "lead",
  title,
  description,
  phone,
  kakaoUrl,
  slug,
  products,
  variant,
  defaultInquiryType,
}: {
  id?: string;
  title: string;
  description?: string;
  phone?: string;
  kakaoUrl?: string;
  /** Landing page slug — the real form re-resolves this server-side rather than trusting a client-supplied landing page id. */
  slug: string;
  products: LandingProduct[];
  variant: LandingVariant;
  defaultInquiryType?: InquiryType;
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
              <TrackedLink
                slug={slug}
                eventType="phone_click"
                href={toTelHref(phone)}
                className={cn(
                  "rounded-lg px-5 py-3 text-sm font-semibold shadow-sm transition",
                  VARIANT_CTA[variant]
                )}
              >
                전화 문의 {phone}
              </TrackedLink>
            )}
            {kakaoUrl && (
              <TrackedLink
                slug={slug}
                eventType="kakao_click"
                href={kakaoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                카카오톡 문의
              </TrackedLink>
            )}
          </div>
        </div>

        <ConsultationForm slug={slug} products={products} variant={variant} defaultInquiryType={defaultInquiryType} />
      </div>
    </section>
  );
}
