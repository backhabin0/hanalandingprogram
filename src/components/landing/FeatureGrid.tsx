import { cn } from "@/lib/utils";
import type { LandingFeature } from "@/types/landing";
import type { LandingVariant } from "./SiteHeader";
import { SectionHeading } from "./SectionHeading";

const VARIANT_SECTION: Record<LandingVariant, string> = {
  a: "bg-slate-50 border-slate-100",
  b: "bg-slate-950 border-white/10",
  c: "bg-stone-50 border-stone-100",
};

const VARIANT_CARD: Record<LandingVariant, string> = {
  a: "bg-white border-slate-200",
  b: "bg-slate-900 border-white/10",
  c: "bg-white border-stone-200",
};

const VARIANT_ICON: Record<LandingVariant, string> = {
  a: "bg-blue-50",
  b: "bg-amber-400/10",
  c: "bg-orange-50",
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

export function FeatureGrid({
  id,
  eyebrow,
  title,
  description,
  features,
  variant,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  features: LandingFeature[];
  variant: LandingVariant;
}) {
  if (features.length === 0) return null;

  return (
    <section id={id} className={cn("border-b", VARIANT_SECTION[variant])}>
      <div className="mx-auto max-w-[1360px] px-6 py-20 lg:px-10">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} variant={variant} />

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.id}
              className={cn("rounded-2xl border p-6", VARIANT_CARD[variant])}
            >
              {feature.icon && (
                <div
                  className={cn(
                    "mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-xl",
                    VARIANT_ICON[variant]
                  )}
                  aria-hidden
                >
                  {feature.icon}
                </div>
              )}
              <h3 className={cn("text-base font-semibold", VARIANT_TITLE[variant])}>
                {feature.title}
              </h3>
              <p className={cn("mt-2 text-sm leading-relaxed", VARIANT_BODY[variant])}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
