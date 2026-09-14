import { cn } from "@/lib/utils";
import type { LandingVariant } from "./SiteHeader";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { SectionHeading } from "./SectionHeading";

const VARIANT_SECTION: Record<LandingVariant, string> = {
  a: "bg-slate-50 border-slate-100",
  b: "bg-slate-900 border-white/10",
  c: "bg-orange-50 border-orange-100",
};

const VARIANT_LABEL: Record<LandingVariant, string> = {
  a: "text-slate-500",
  b: "text-slate-400",
  c: "text-stone-500",
};

const VARIANT_VALUE: Record<LandingVariant, string> = {
  a: "text-slate-900",
  b: "text-white",
  c: "text-stone-900",
};

const VARIANT_IMAGE_TONE: Record<LandingVariant, "blue" | "amber" | "orange"> = {
  a: "blue",
  b: "amber",
  c: "orange",
};

export function LocationSection({
  id = "location",
  title,
  description,
  address,
  region,
  phone,
  kakaoUrl,
  variant,
}: {
  id?: string;
  title: string;
  description?: string;
  address?: string;
  region?: string;
  phone?: string;
  kakaoUrl?: string;
  variant: LandingVariant;
}) {
  return (
    <section id={id} className={cn("border-b", VARIANT_SECTION[variant])}>
      <div className="mx-auto grid max-w-[1360px] items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:px-10">
        <div>
          <SectionHeading title={title} description={description} variant={variant} />

          <dl className="mt-8 space-y-5">
            {address && (
              <div>
                <dt className={cn("text-xs font-semibold uppercase tracking-wide", VARIANT_LABEL[variant])}>
                  주소
                </dt>
                <dd className={cn("mt-1 text-base font-medium", VARIANT_VALUE[variant])}>{address}</dd>
              </div>
            )}
            {region && (
              <div>
                <dt className={cn("text-xs font-semibold uppercase tracking-wide", VARIANT_LABEL[variant])}>
                  서비스 지역
                </dt>
                <dd className={cn("mt-1 text-base font-medium", VARIANT_VALUE[variant])}>{region}</dd>
              </div>
            )}
            {phone && (
              <div>
                <dt className={cn("text-xs font-semibold uppercase tracking-wide", VARIANT_LABEL[variant])}>
                  전화 문의
                </dt>
                <dd className={cn("mt-1 text-base font-medium", VARIANT_VALUE[variant])}>
                  <a href={`tel:${phone}`}>{phone}</a>
                </dd>
              </div>
            )}
            {kakaoUrl && (
              <div>
                <dt className={cn("text-xs font-semibold uppercase tracking-wide", VARIANT_LABEL[variant])}>
                  카카오톡 문의
                </dt>
                <dd className={cn("mt-1 text-base font-medium", VARIANT_VALUE[variant])}>
                  <a href={kakaoUrl} target="_blank" rel="noreferrer">
                    카카오톡 채널 바로가기
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>

        <ImagePlaceholder label="지도 영역 (연동 예정)" ratio="aspect-[4/3]" tone={VARIANT_IMAGE_TONE[variant]} />
      </div>
    </section>
  );
}
