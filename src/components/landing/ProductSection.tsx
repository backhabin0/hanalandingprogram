import { cn } from "@/lib/utils";
import type { LandingProduct } from "@/types/landing";
import type { LandingVariant } from "./SiteHeader";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { SectionHeading } from "./SectionHeading";

const VARIANT_SECTION: Record<LandingVariant, string> = {
  a: "bg-white border-slate-100",
  b: "bg-slate-900 border-white/10",
  c: "bg-white border-stone-100",
};

const VARIANT_DIVIDER: Record<LandingVariant, string> = {
  a: "border-slate-100",
  b: "border-white/10",
  c: "border-stone-100",
};

const VARIANT_TITLE: Record<LandingVariant, string> = {
  a: "text-slate-900",
  b: "text-white",
  c: "text-stone-900",
};

const VARIANT_LEAD: Record<LandingVariant, string> = {
  a: "text-slate-700",
  b: "text-slate-200",
  c: "text-stone-700",
};

const VARIANT_BODY: Record<LandingVariant, string> = {
  a: "text-slate-600",
  b: "text-slate-400",
  c: "text-stone-600",
};

const VARIANT_PRICE_BOX: Record<LandingVariant, string> = {
  a: "border-blue-100 bg-blue-50 text-blue-700",
  b: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  c: "border-orange-100 bg-orange-50 text-orange-700",
};

const VARIANT_CTA: Record<LandingVariant, string> = {
  a: "bg-blue-600 text-white hover:bg-blue-700",
  b: "bg-amber-400 text-slate-950 hover:bg-amber-300",
  c: "bg-orange-600 text-white hover:bg-orange-700",
};

const VARIANT_IMAGE_TONE: Record<LandingVariant, "blue" | "amber" | "orange"> = {
  a: "blue",
  b: "amber",
  c: "orange",
};

export function ProductSection({
  id = "products",
  eyebrow,
  title,
  description,
  products,
  variant,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  products: LandingProduct[];
  variant: LandingVariant;
}) {
  if (products.length === 0) return null;

  return (
    <section id={id} className={cn("border-b", VARIANT_SECTION[variant])}>
      <div className="mx-auto max-w-[1360px] px-6 py-20 lg:px-10">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} variant={variant} />

        <div className="mt-14 space-y-20">
          {products.map((product, index) => {
            const reversed = index % 2 === 1;
            return (
              <article
                key={product.id}
                className={cn(
                  "grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-20",
                  index > 0 && "border-t pt-20",
                  VARIANT_DIVIDER[variant]
                )}
              >
                <div className={reversed ? "lg:order-2" : undefined}>
                  <ImagePlaceholder
                    label={`${product.name} 이미지`}
                    src={product.image}
                    ratio="aspect-[4/3]"
                    tone={VARIANT_IMAGE_TONE[variant]}
                  />
                  {product.images && product.images.filter((img) => img.isActive !== false).length > 0 && (
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {product.images
                        .filter((img) => img.isActive !== false)
                        .map((img) => (
                          <ImagePlaceholder
                            key={img.id}
                            label={img.altText || `${product.name} 이미지`}
                            src={img.imageUrl}
                            ratio="aspect-square"
                            tone={VARIANT_IMAGE_TONE[variant]}
                          />
                        ))}
                    </div>
                  )}
                </div>

                <div className={reversed ? "lg:order-1" : undefined}>
                  <h3 className={cn("text-2xl font-bold tracking-tight sm:text-3xl", VARIANT_TITLE[variant])}>
                    {product.name}
                  </h3>
                  <p className={cn("mt-3 text-lg font-medium", VARIANT_LEAD[variant])}>
                    {product.shortDescription}
                  </p>
                  <p className={cn("mt-4 max-w-2xl whitespace-pre-line text-base leading-relaxed", VARIANT_BODY[variant])}>
                    {product.description}
                  </p>

                  {(product.price || product.priceNote) && (
                    <div
                      className={cn(
                        "mt-6 inline-flex flex-wrap items-baseline gap-2 rounded-lg border px-4 py-3",
                        VARIANT_PRICE_BOX[variant]
                      )}
                    >
                      {product.priceLabel && (
                        <span className="w-full text-xs font-semibold uppercase tracking-wide opacity-70">
                          {product.priceLabel}
                        </span>
                      )}
                      {product.price && (
                        <span className="text-xl font-bold">{product.price}</span>
                      )}
                      {product.priceUnit && (
                        <span className="text-sm font-medium opacity-80">{product.priceUnit}</span>
                      )}
                      {product.priceNote && (
                        <span className="w-full text-xs opacity-70">{product.priceNote}</span>
                      )}
                    </div>
                  )}

                  {product.ctaText && (
                    <div className="mt-6">
                      <a
                        href="#lead"
                        className={cn(
                          "inline-block rounded-lg px-5 py-3 text-sm font-semibold shadow-sm transition",
                          VARIANT_CTA[variant]
                        )}
                      >
                        {product.ctaText}
                      </a>
                    </div>
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
