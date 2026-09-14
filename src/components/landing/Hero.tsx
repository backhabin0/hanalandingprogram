import { cn } from "@/lib/utils";
import { ImagePlaceholder } from "./ImagePlaceholder";
import type { LandingVariant } from "./SiteHeader";

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

export function Hero({
  id = "top",
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  imageLabel,
  variant,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  imageLabel: string;
  variant: LandingVariant;
}) {
  return (
    <section id={id} className={cn("border-b", VARIANT_SECTION[variant], variant === "b" ? "border-white/10" : "border-slate-100")}>
      <div className="mx-auto grid max-w-[1360px] gap-14 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-10 lg:py-28">
        <div>
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
          <h1 className="mt-5 text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className={cn("mt-6 max-w-xl text-lg leading-relaxed", VARIANT_DESCRIPTION[variant])}>
            {description}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href={primaryCta.href}
              className={cn(
                "rounded-lg px-6 py-3.5 text-base font-semibold shadow-sm transition",
                VARIANT_PRIMARY_CTA[variant]
              )}
            >
              {primaryCta.label}
            </a>
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
        </div>

        <ImagePlaceholder
          label={imageLabel}
          ratio="aspect-[4/3]"
          tone={VARIANT_IMAGE_TONE[variant]}
          className="shadow-xl"
        />
      </div>
    </section>
  );
}
