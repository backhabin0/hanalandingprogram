import { cn, toTelHref } from "@/lib/utils";

export type LandingVariant = "a" | "b" | "c";

const VARIANT_ACCENT_BAR: Record<LandingVariant, string> = {
  a: "bg-gradient-to-r from-blue-600 via-blue-500 to-slate-900",
  b: "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500",
  c: "bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400",
};

const VARIANT_HEADER: Record<LandingVariant, string> = {
  a: "bg-white/95 text-slate-900 border-slate-200",
  b: "bg-slate-950/95 text-white border-white/10",
  c: "bg-white/95 text-stone-900 border-stone-200",
};

const VARIANT_CTA: Record<LandingVariant, string> = {
  a: "rounded-lg bg-blue-600 text-white hover:bg-blue-700",
  b: "rounded-lg bg-amber-400 text-slate-950 hover:bg-amber-300",
  c: "rounded-full bg-orange-600 text-white hover:bg-orange-700",
};

const VARIANT_MARK: Record<LandingVariant, string> = {
  a: "rounded-lg bg-blue-600",
  b: "rounded-lg bg-amber-400 text-slate-950",
  c: "rounded-full bg-orange-600",
};

const VARIANT_NAME: Record<LandingVariant, string> = {
  a: "text-lg font-bold tracking-tight",
  b: "text-lg font-black uppercase tracking-wide",
  c: "text-lg font-semibold tracking-tight",
};

const VARIANT_NAV_ITEM: Record<LandingVariant, string> = {
  a: "opacity-80 transition hover:opacity-100 hover:text-blue-700",
  b: "opacity-80 transition hover:opacity-100 hover:text-amber-300",
  c: "rounded-full px-3 py-1.5 opacity-80 transition hover:bg-orange-50 hover:opacity-100 hover:text-orange-700",
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
    <header className={cn("sticky top-0 z-40 border-b backdrop-blur", VARIANT_HEADER[variant])}>
      <div className={cn("h-[3px] w-full", VARIANT_ACCENT_BAR[variant])} aria-hidden />
      <div className="mx-auto flex h-[76px] max-w-[1360px] items-center justify-between px-6 lg:px-10">
        <a href="#top" className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center text-sm font-bold text-white",
              VARIANT_MARK[variant]
            )}
          >
            {businessName.slice(0, 1)}
          </span>
          <span className={VARIANT_NAME[variant]}>{businessName}</span>
        </a>

        <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className={VARIANT_NAV_ITEM[variant]}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {phone && (
            <a href={toTelHref(phone)} className="hidden text-sm font-semibold sm:inline-block">
              {phone}
            </a>
          )}
          <a
            href={ctaHref}
            className={cn("px-4 py-2.5 text-sm font-semibold shadow-sm transition", VARIANT_CTA[variant])}
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </header>
  );
}
