import { cn } from "@/lib/utils";
import type { LandingGalleryImage } from "@/types/landing";
import type { LandingVariant } from "./SiteHeader";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { SectionHeading } from "./SectionHeading";

const VARIANT_SECTION: Record<LandingVariant, string> = {
  a: "bg-white border-slate-100",
  b: "bg-slate-950 border-white/10",
  c: "bg-orange-50 border-orange-100",
};

const VARIANT_CAPTION: Record<LandingVariant, string> = {
  a: "text-slate-500",
  b: "text-slate-400",
  c: "text-stone-600",
};

const VARIANT_IMAGE_TONE: Record<LandingVariant, "blue" | "amber" | "orange"> = {
  a: "blue",
  b: "amber",
  c: "orange",
};

/**
 * Whole-page photo gallery — renders nothing when there are no active
 * photos (never a fake/placeholder gallery). Same data and component
 * across Template A/B/C; only `eyebrow`/`title` differ per call site to
 * match each template's framing (install/site photos vs. product shots vs.
 * storefront/facility photos).
 */
export function PageGallerySection({
  id = "gallery",
  eyebrow,
  title,
  description,
  images,
  variant,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  images: LandingGalleryImage[];
  variant: LandingVariant;
}) {
  const active = images.filter((img) => img.isActive !== false);
  if (active.length === 0) return null;

  return (
    <section id={id} className={cn("border-b", VARIANT_SECTION[variant])}>
      <div className="mx-auto max-w-[1360px] px-6 py-20 lg:px-10">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} variant={variant} />

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {active.map((image) => (
            <figure key={image.id}>
              <ImagePlaceholder
                label={image.altText || title}
                src={image.imageUrl}
                ratio="aspect-square"
                tone={VARIANT_IMAGE_TONE[variant]}
              />
              {image.caption && (
                <figcaption className={cn("mt-2 text-xs leading-relaxed", VARIANT_CAPTION[variant])}>
                  {image.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
