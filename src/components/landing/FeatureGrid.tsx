import { cn } from "@/lib/utils";
import type { LandingFeature } from "@/types/landing";
import type { LandingVariant } from "./SiteHeader";
import { SectionHeading } from "./SectionHeading";

const VARIANT_SECTION: Record<LandingVariant, string> = {
  a: "bg-slate-50 border-slate-100",
  b: "bg-slate-950 border-white/10",
  c: "bg-stone-50 border-stone-100",
};

const VARIANT_ICON: Record<LandingVariant, string> = {
  a: "bg-blue-100 text-blue-700",
  b: "bg-amber-400/15 text-amber-300",
  c: "bg-orange-100 text-orange-700",
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

const VARIANT_TOP_RULE: Record<LandingVariant, string> = {
  a: "border-slate-200",
  b: "border-white/10",
  c: "border-stone-200",
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

        <div className="mt-14 grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.id} className={cn("border-t pt-6", VARIANT_TOP_RULE[variant])}>
              {feature.icon && (
                <div
                  className={cn(
                    "mb-5 flex h-12 w-12 items-center justify-center rounded-full text-xl",
                    VARIANT_ICON[variant]
                  )}
                  aria-hidden
                >
                  {feature.icon}
                </div>
              )}
              <h3 className={cn("text-lg font-semibold", VARIANT_TITLE[variant])}>{feature.title}</h3>
              <p className={cn("mt-2.5 text-sm leading-relaxed whitespace-pre-line", VARIANT_BODY[variant])}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
