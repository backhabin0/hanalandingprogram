import { cn } from "@/lib/utils";
import type { LandingMetric } from "@/types/landing";
import type { LandingVariant } from "./SiteHeader";
import { SectionHeading } from "./SectionHeading";

const VARIANT_SECTION: Record<LandingVariant, string> = {
  a: "bg-white border-slate-100",
  b: "bg-slate-900 border-white/10",
  c: "bg-white border-stone-100",
};

const VARIANT_VALUE: Record<LandingVariant, string> = {
  a: "text-blue-600",
  b: "text-amber-400",
  c: "text-orange-600",
};

const VARIANT_LABEL: Record<LandingVariant, string> = {
  a: "text-slate-500",
  b: "text-slate-400",
  c: "text-stone-500",
};

const VARIANT_TEXT: Record<LandingVariant, string> = {
  a: "text-slate-900",
  b: "text-white",
  c: "text-stone-900",
};

const VARIANT_BADGE: Record<LandingVariant, string> = {
  a: "border-slate-200 text-slate-600",
  b: "border-white/15 text-slate-300",
  c: "border-stone-200 text-stone-600",
};

const VARIANT_DIVIDER: Record<LandingVariant, string> = {
  a: "divide-slate-100 border-slate-100",
  b: "divide-white/10 border-white/10",
  c: "divide-stone-100 border-stone-100",
};

export function TrustMetrics({
  id,
  eyebrow,
  title,
  metrics,
  badges,
  variant,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  metrics: LandingMetric[];
  badges?: string[];
  variant: LandingVariant;
}) {
  const hasBadges = Boolean(badges && badges.length > 0);
  if (metrics.length === 0 && !hasBadges) return null;

  return (
    <section id={id} className={cn("border-b", VARIANT_SECTION[variant])}>
      <div className="mx-auto max-w-[1360px] px-6 py-14 lg:px-10">
        {title && (
          <SectionHeading eyebrow={eyebrow} title={title} variant={variant} />
        )}

        <div
          className={cn(
            "grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4 md:divide-x",
            title && "mt-10",
            VARIANT_DIVIDER[variant]
          )}
        >
          {metrics.map((metric, index) => (
            <div key={metric.id} className={cn(index > 0 && "md:pl-8")}>
              <p className={cn("text-4xl font-bold tracking-tight lg:text-5xl", VARIANT_VALUE[variant])}>
                {metric.value}
              </p>
              <p className={cn("mt-2 text-sm font-medium", VARIANT_TEXT[variant])}>{metric.label}</p>
              {metric.description && (
                <p className={cn("mt-0.5 text-xs", VARIANT_LABEL[variant])}>{metric.description}</p>
              )}
            </div>
          ))}
        </div>

        {badges && badges.length > 0 && (
          <div className={cn("mt-10 flex flex-wrap gap-2.5 border-t pt-8", VARIANT_DIVIDER[variant])}>
            {badges.map((badge) => (
              <span
                key={badge}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-medium",
                  VARIANT_BADGE[variant]
                )}
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
