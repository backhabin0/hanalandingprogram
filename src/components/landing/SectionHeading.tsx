import { cn } from "@/lib/utils";
import type { LandingVariant } from "./SiteHeader";

const VARIANT_EYEBROW: Record<LandingVariant, string> = {
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

/** Shared H2 + eyebrow + description block used at the top of every section. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  variant,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  variant: LandingVariant;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && (
        <p className={cn("mb-3 text-sm font-semibold uppercase tracking-wide", VARIANT_EYEBROW[variant])}>
          {eyebrow}
        </p>
      )}
      <h2 className={cn("text-3xl font-bold tracking-tight sm:text-4xl", VARIANT_TITLE[variant])}>
        {title}
      </h2>
      {description && (
        <p className={cn("mt-4 whitespace-pre-line text-base leading-relaxed", VARIANT_BODY[variant])}>
          {description}
        </p>
      )}
    </div>
  );
}
