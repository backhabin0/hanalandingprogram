import { cn } from "@/lib/utils";
import type { LandingFaq } from "@/types/landing";
import type { LandingVariant } from "./SiteHeader";
import { SectionHeading } from "./SectionHeading";

const VARIANT_SECTION: Record<LandingVariant, string> = {
  a: "bg-white border-slate-100",
  b: "bg-slate-900 border-white/10",
  c: "bg-white border-stone-100",
};

const VARIANT_DIVIDER: Record<LandingVariant, string> = {
  a: "divide-slate-100",
  b: "divide-white/10",
  c: "divide-stone-100",
};

const VARIANT_QUESTION: Record<LandingVariant, string> = {
  a: "text-slate-900",
  b: "text-white",
  c: "text-stone-900",
};

const VARIANT_ANSWER: Record<LandingVariant, string> = {
  a: "text-slate-600",
  b: "text-slate-400",
  c: "text-stone-600",
};

const VARIANT_MARK: Record<LandingVariant, string> = {
  a: "text-blue-600",
  b: "text-amber-400",
  c: "text-orange-600",
};

/**
 * Renders as native <details>/<summary> — no JS required, fully readable by
 * search/AI crawlers, and answers questions in real HTML text (AEO).
 */
export function FAQSection({
  id = "faq",
  eyebrow = "자주 묻는 질문",
  title,
  description,
  faqs,
  variant,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  faqs: LandingFaq[];
  variant: LandingVariant;
}) {
  return (
    <section id={id} className={cn("border-b", VARIANT_SECTION[variant])}>
      <div className="mx-auto max-w-[900px] px-6 py-20 lg:px-10">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} variant={variant} />

        <div className={cn("mt-10 divide-y", VARIANT_DIVIDER[variant])}>
          {[...faqs]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((faq) => (
              <details key={faq.id} className="group py-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                  <h3 className={cn("text-base font-semibold leading-relaxed", VARIANT_QUESTION[variant])}>
                    <span className={cn("mr-2", VARIANT_MARK[variant])}>Q.</span>
                    {faq.question}
                  </h3>
                  <span
                    className={cn(
                      "mt-0.5 shrink-0 text-xl font-light transition-transform group-open:rotate-45",
                      VARIANT_MARK[variant]
                    )}
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <p className={cn("mt-3 pl-6 text-sm leading-relaxed", VARIANT_ANSWER[variant])}>
                  {faq.answer}
                </p>
              </details>
            ))}
        </div>
      </div>
    </section>
  );
}
