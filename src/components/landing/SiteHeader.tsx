import { cn } from "@/lib/utils";

export type LandingVariant = "a" | "b" | "c";

const VARIANT_HEADER: Record<LandingVariant, string> = {
  a: "bg-white/95 text-slate-900 border-slate-200",
  b: "bg-slate-950/95 text-white border-white/10",
  c: "bg-white/95 text-stone-900 border-stone-200",
};

const VARIANT_CTA: Record<LandingVariant, string> = {
  a: "bg-blue-600 text-white hover:bg-blue-700",
  b: "bg-amber-400 text-slate-950 hover:bg-amber-300",
  c: "bg-orange-600 text-white hover:bg-orange-700",
};

const VARIANT_MARK: Record<LandingVariant, string> = {
  a: "bg-blue-600",
  b: "bg-amber-400 text-slate-950",
  c: "bg-orange-600",
};

export function SiteHeader({
  businessName,
  navItems,
  phone,
  ctaLabel = "상담 신청",
  ctaHref = "#lead",
  variant,
}: {
  businessName: string;
  navItems: { label: string; href: string }[];
  phone?: string;
  ctaLabel?: string;
  ctaHref?: string;
  variant: LandingVariant;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b backdrop-blur",
        VARIANT_HEADER[variant]
      )}
    >
      <div className="mx-auto flex h-20 max-w-[1360px] items-center justify-between px-6 lg:px-10">
        <a href="#top" className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white",
              VARIANT_MARK[variant]
            )}
          >
            {businessName.slice(0, 1)}
          </span>
          <span className="text-lg font-bold tracking-tight">{businessName}</span>
        </a>

        <nav className="hidden items-center gap-8 text-sm font-medium lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="opacity-80 transition hover:opacity-100"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="hidden text-sm font-semibold sm:inline-block"
            >
              {phone}
            </a>
          )}
          <a
            href={ctaHref}
            className={cn(
              "rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition",
              VARIANT_CTA[variant]
            )}
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </header>
  );
}
