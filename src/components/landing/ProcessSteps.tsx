import { cn } from "@/lib/utils";
import type { LandingProcessStep } from "@/types/landing";
import type { LandingVariant } from "./SiteHeader";
import { SectionHeading } from "./SectionHeading";

const VARIANT_SECTION: Record<LandingVariant, string> = {
  a: "bg-white border-slate-100",
  b: "bg-slate-950 border-white/10",
  c: "bg-white border-stone-100",
};

const VARIANT_NUMBER: Record<LandingVariant, string> = {
  a: "bg-blue-600 text-white",
  b: "bg-amber-400 text-slate-950",
  c: "bg-orange-600 text-white",
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

const VARIANT_CONNECTOR: Record<LandingVariant, string> = {
  a: "bg-slate-200",
  b: "bg-white/10",
  c: "bg-stone-200",
};

export function ProcessSteps({
  id = "process",
  eyebrow,
  title,
  description,
  steps,
  variant,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  steps: LandingProcessStep[];
  variant: LandingVariant;
}) {
  if (steps.length === 0) return null;

  return (
    <section id={id} className={cn("border-b", VARIANT_SECTION[variant])}>
      <div className="mx-auto max-w-[1360px] px-6 py-20 lg:px-10">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} variant={variant} />

        <ol className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.id} className="relative">
              {index < steps.length - 1 && (
                <span
                  className={cn(
                    "absolute right-[-1.25rem] top-6 hidden h-px w-10 lg:block",
                    VARIANT_CONNECTOR[variant]
                  )}
                  aria-hidden
                />
              )}
              <span
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold",
                  VARIANT_NUMBER[variant]
                )}
              >
                {step.step}
              </span>
              <h3 className={cn("mt-5 text-base font-semibold", VARIANT_TITLE[variant])}>
                {step.title}
              </h3>
              <p className={cn("mt-2 text-sm leading-relaxed", VARIANT_BODY[variant])}>
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
