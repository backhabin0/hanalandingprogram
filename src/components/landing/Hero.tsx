import { cn } from "@/lib/utils";
import { ImagePlaceholder } from "./ImagePlaceholder";
import type { LandingVariant } from "./SiteHeader";
import { TrackedLink } from "@/components/analytics/TrackedLink";

const VARIANT_SECTION: Record<LandingVariant, string> = {
  a: "bg-gradient-to-b from-blue-50 via-white to-white text-slate-900",
  b: "bg-slate-950 text-white",
  c: "bg-gradient-to-b from-orange-50 via-white to-white text-stone-900",
};

const VARIANT_EYEBROW: Record<LandingVariant, string> = {
  a: "bg-blue-100 text-blue-700",
  b: "bg-amber-400/15 text-amber-300",
  c: "bg-orange-100 text-orange-700",
};

const VARIANT_TITLE: Record<LandingVariant, string> = {
  a: "text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl",
  b: "text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-7xl",
  c: "text-4xl font-semibold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl",
};

const VARIANT_PRIMARY_CTA: Record<LandingVariant, string> = {
  a: "bg-blue-600 text-white hover:bg-blue-700",
  b: "bg-amber-400 text-slate-950 hover:bg-amber-300",
  c: "bg-orange-600 text-white hover:bg-orange-700",
};

const VARIANT_SECONDARY_CTA: Record<LandingVariant, string> = {
  a: "border-slate-300 text-slate-700 hover:bg-slate-50",
  b: "border-white/20 text-white hover:bg-white/10",
  c: "border-stone-300 text-stone-700 hover:bg-stone-50",
};

const VARIANT_DESCRIPTION: Record<LandingVariant, string> = {
  a: "text-slate-600",
  b: "text-slate-300",
  c: "text-stone-600",
};

const VARIANT_IMAGE_TONE: Record<LandingVariant, "blue" | "amber" | "orange"> = {
  a: "blue",
  b: "amber",
  c: "orange",
};

const VARIANT_GRID: Record<LandingVariant, string> = {
  a: "lg:grid-cols-[1.05fr_0.95fr]",
  b: "lg:grid-cols-[0.95fr_1.05fr]",
  c: "lg:grid-cols-[1fr_1fr]",
};

const VARIANT_PRICE_BADGE: Record<LandingVariant, string> = {
  a: "border-blue-200 bg-blue-50 text-blue-700",
  b: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  c: "border-orange-200 bg-orange-50 text-orange-700",
};

const VARIANT_FACT_DIVIDER: Record<LandingVariant, string> = {
  a: "divide-slate-200",
  b: "divide-white/15",
  c: "divide-stone-300",
};

export function Hero({
  id = "top",
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  imageLabel,
  imageUrl,
  slug,
  variant,
  imagePosition = "right",
  priceBadge,
  facts,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  imageLabel: string;
  imageUrl?: string;
  slug: string;
  variant: LandingVariant;
  /** Which side the visual sits on — Template B flips this to lead with product imagery. */
  imagePosition?: "left" | "right";
  /** Compact price highlight shown under the CTAs — used by the product template (Template B). */
  priceBadge?: { label?: string; price: string; unit?: string };
  /** Quick-glance facts (region, phone, hours) shown under the CTAs — used by the local-service template (Template C). */
  facts?: { label: string; value: string }[];
}) {
  return (
    <section
      id={id}
      className={cn("border-b", VARIANT_SECTION[variant], variant === "b" ? "border-white/10" : "border-slate-100")}
    >
      <div
        className={cn(
          "mx-auto grid max-w-[1360px] gap-14 px-6 py-20 lg:items-center lg:gap-16 lg:px-10 lg:py-28",
          VARIANT_GRID[variant]
        )}
      >
        <div className={imagePosition === "left" ? "lg:order-2" : undefined}>
          {eyebrow && (
            <span
              className={cn(
                "inline-block rounded-full px-3.5 py-1.5 text-sm font-semibold",
                VARIANT_EYEBROW[variant]
              )}
            >
              {eyebrow}
            </span>
          )}
          <h1 className={cn("mt-5", VARIANT_TITLE[variant])}>{title}</h1>
          <p className={cn("mt-6 max-w-xl text-lg leading-relaxed", VARIANT_DESCRIPTION[variant])}>
            {description}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <TrackedLink
              slug={slug}
              eventType="quote_cta_click"
              href={primaryCta.href}
              className={cn(
                "rounded-lg px-6 py-3.5 text-base font-semibold shadow-sm transition",
                VARIANT_PRIMARY_CTA[variant]
              )}
            >
              {primaryCta.label}
            </TrackedLink>
            {secondaryCta && (
              <a
                href={secondaryCta.href}
                className={cn(
                  "rounded-lg border px-6 py-3.5 text-base font-semibold transition",
                  VARIANT_SECONDARY_CTA[variant]
                )}
              >
                {secondaryCta.label}
              </a>
            )}
          </div>

          {priceBadge && (
            <div
              className={cn(
                "mt-8 inline-flex flex-wrap items-baseline gap-2 rounded-xl border px-5 py-4",
                VARIANT_PRICE_BADGE[variant]
              )}
            >
              {priceBadge.label && <span className="text-sm font-medium opacity-80">{priceBadge.label}</span>}
              <span className="text-2xl font-bold tracking-tight">{priceBadge.price}</span>
              {priceBadge.unit && <span className="text-sm font-medium opacity-80">{priceBadge.unit}</span>}
            </div>
          )}

          {facts && facts.length > 0 && (
            <dl
              className={cn(
                "mt-8 flex flex-wrap divide-x text-sm",
                VARIANT_FACT_DIVIDER[variant]
              )}
            >
              {facts.map((fact) => (
                <div key={fact.label} className="px-4 first:pl-0">
                  <dt className={cn("text-xs font-semibold uppercase tracking-wide", VARIANT_DESCRIPTION[variant])}>
                    {fact.label}
                  </dt>
                  <dd className="mt-1 font-semibold">{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <ImagePlaceholder
          label={imageLabel}
          src={imageUrl}
          ratio="aspect-[4/3]"
          tone={VARIANT_IMAGE_TONE[variant]}
          className={cn("shadow-xl", imagePosition === "left" && "lg:order-1")}
        />
      </div>
    </section>
  );
}
