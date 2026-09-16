import { cn } from "@/lib/utils";
import type { LandingPriceSummary, LandingProduct } from "@/types/landing";
import type { LandingVariant } from "./SiteHeader";
import { SectionHeading } from "./SectionHeading";
import { TrackedLink } from "@/components/analytics/TrackedLink";

const VARIANT_SECTION: Record<LandingVariant, string> = {
  a: "bg-slate-50 border-slate-100",
  b: "bg-slate-950 border-white/10",
  c: "bg-stone-50 border-stone-100",
};

const VARIANT_SUMMARY_CARD: Record<LandingVariant, string> = {
  a: "bg-white border-slate-200",
  b: "bg-slate-900 border-white/10",
  c: "bg-white border-stone-200",
};

const VARIANT_PRICE: Record<LandingVariant, string> = {
  a: "text-blue-600",
  b: "text-amber-400",
  c: "text-orange-600",
};

const VARIANT_TITLE: Record<LandingVariant, string> = {
  a: "text-slate-900",
  b: "text-white",
  c: "text-stone-900",
};

const VARIANT_BODY: Record<LandingVariant, string> = {
  a: "text-slate-600",
  b: "text-slate-400",
  c: "text-stone-600",
};

const VARIANT_CTA: Record<LandingVariant, string> = {
  a: "bg-blue-600 text-white hover:bg-blue-700",
  b: "bg-amber-400 text-slate-950 hover:bg-amber-300",
  c: "bg-orange-600 text-white hover:bg-orange-700",
};

const VARIANT_TIER_CARD: Record<LandingVariant, string> = {
  a: "bg-white border-slate-200",
  b: "bg-slate-900 border-white/10",
  c: "bg-white border-stone-200",
};

export function PricingSection({
  id = "pricing",
  eyebrow,
  title,
  description,
  mode,
  summary,
  products,
  slug,
  variant,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  mode: "summary" | "tiers";
  summary?: LandingPriceSummary;
  products?: LandingProduct[];
  slug: string;
  variant: LandingVariant;
}) {
  if (mode === "summary" && !summary) return null;
  if (mode === "tiers" && (!products || products.length === 0)) return null;

  return (
    <section id={id} className={cn("border-b", VARIANT_SECTION[variant])}>
      <div className="mx-auto max-w-[1360px] px-6 py-20 lg:px-10">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          variant={variant}
          align={mode === "summary" ? "center" : "left"}
        />

        {mode === "summary" && summary && (
          <div
            className={cn(
              "mx-auto mt-12 max-w-xl rounded-xl border p-10 text-center shadow-sm",
              VARIANT_SUMMARY_CARD[variant]
            )}
          >
            {summary.label && (
              <p className={cn("text-sm font-semibold uppercase tracking-wide", VARIANT_BODY[variant])}>
                {summary.label}
              </p>
            )}
            <p className={cn("mt-3 text-4xl font-bold tracking-tight sm:text-5xl", VARIANT_PRICE[variant])}>
              {summary.price}
              {summary.priceUnit && (
                <span className={cn("ml-2 text-lg font-medium", VARIANT_BODY[variant])}>
                  {summary.priceUnit}
                </span>
              )}
            </p>
            {summary.description && (
              <p className={cn("mx-auto mt-4 max-w-sm text-sm leading-relaxed", VARIANT_BODY[variant])}>
                {summary.description}
              </p>
            )}
            <TrackedLink
              slug={slug}
              eventType="quote_cta_click"
              href="#lead"
              className={cn(
                "mt-8 inline-block rounded-lg px-6 py-3.5 text-sm font-semibold shadow-sm transition",
                VARIANT_CTA[variant]
              )}
            >
              정확한 견적 상담받기
            </TrackedLink>
          </div>
        )}

        {mode === "tiers" && products && (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.id}
                className={cn("flex flex-col rounded-xl border p-6", VARIANT_TIER_CARD[variant])}
              >
                <h3 className={cn("text-base font-semibold", VARIANT_TITLE[variant])}>{product.name}</h3>
                <p className={cn("mt-1.5 text-sm leading-relaxed", VARIANT_BODY[variant])}>
                  {product.shortDescription}
                </p>
                <p className={cn("mt-5 text-3xl font-bold tracking-tight", VARIANT_PRICE[variant])}>
                  {product.price}
                </p>
                {product.priceUnit && (
                  <p className={cn("text-xs", VARIANT_BODY[variant])}>{product.priceUnit}</p>
                )}
                {product.priceNote && (
                  <p className={cn("mt-1 text-xs", VARIANT_BODY[variant])}>{product.priceNote}</p>
                )}
                <TrackedLink
                  slug={slug}
                  eventType="product_cta_click"
                  productId={product.id}
                  href="#lead"
                  className={cn(
                    "mt-6 inline-block rounded-lg px-4 py-2.5 text-center text-sm font-semibold shadow-sm transition",
                    VARIANT_CTA[variant]
                  )}
                >
                  {product.ctaText ?? "문의하기"}
                </TrackedLink>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
