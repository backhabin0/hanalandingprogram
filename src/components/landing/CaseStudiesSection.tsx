import { cn } from "@/lib/utils";
import type { LandingCase } from "@/types/landing";
import type { LandingVariant } from "./SiteHeader";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { SectionHeading } from "./SectionHeading";

const VARIANT_SECTION: Record<LandingVariant, string> = {
  a: "bg-slate-50 border-slate-100",
  b: "bg-black border-white/10",
  c: "bg-white border-stone-100",
};

const VARIANT_CARD: Record<LandingVariant, string> = {
  a: "bg-white border-slate-200",
  b: "bg-slate-950 border-white/10",
  c: "bg-stone-50 border-stone-200",
};

const VARIANT_TITLE: Record<LandingVariant, string> = {
  a: "text-slate-900",
  b: "text-white",
  c: "text-stone-900",
};

const VARIANT_META: Record<LandingVariant, string> = {
  a: "text-slate-500",
  b: "text-slate-400",
  c: "text-stone-500",
};

const VARIANT_BODY: Record<LandingVariant, string> = {
  a: "text-slate-600",
  b: "text-slate-400",
  c: "text-stone-600",
};

const VARIANT_IMAGE_TONE: Record<LandingVariant, "blue" | "amber" | "orange"> = {
  a: "blue",
  b: "amber",
  c: "orange",
};

function formatCaseDate(value?: string): string | undefined {
  if (!value) return undefined;
  const [year, month] = value.split("-");
  if (!year || !month) return value;
  return `${year}년 ${Number(month)}월`;
}

/**
 * Install/service case studies — real content depth for local SEO. Renders
 * nothing when there are no active cases; never fabricates a placeholder
 * case (see Stage 8 report).
 */
export function CaseStudiesSection({
  id = "cases",
  eyebrow,
  title,
  description,
  cases,
  variant,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  cases: LandingCase[];
  variant: LandingVariant;
}) {
  const active = cases.filter((c) => c.isActive !== false);
  if (active.length === 0) return null;

  return (
    <section id={id} className={cn("border-b", VARIANT_SECTION[variant])}>
      <div className="mx-auto max-w-[1360px] px-6 py-20 lg:px-10">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} variant={variant} />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((item) => {
            const meta = [item.region, item.industry, formatCaseDate(item.caseDate)].filter(Boolean).join(" · ");
            return (
              <article key={item.id} className={cn("overflow-hidden rounded-xl border", VARIANT_CARD[variant])}>
                <ImagePlaceholder
                  label={`${item.title} 이미지`}
                  src={item.imageUrl}
                  ratio="aspect-[4/3]"
                  tone={VARIANT_IMAGE_TONE[variant]}
                />
                <div className="p-5">
                  {meta && <p className={cn("text-xs font-medium uppercase tracking-wide", VARIANT_META[variant])}>{meta}</p>}
                  <h3 className={cn("mt-2 text-base font-semibold", VARIANT_TITLE[variant])}>{item.title}</h3>
                  {item.description && (
                    <p className={cn("mt-2 whitespace-pre-line text-sm leading-relaxed", VARIANT_BODY[variant])}>
                      {item.description}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
