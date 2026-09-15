import { cn } from "@/lib/utils";

/**
 * Stand-in for real photography/product imagery. Stage 1 has no asset
 * pipeline yet, so every "image" slot in the template system renders one of
 * these instead of an <img>. Swapping in real images later is a drop-in
 * replacement at the call site.
 */
export function ImagePlaceholder({
  label,
  ratio = "aspect-[4/3]",
  tone = "slate",
  className,
  src,
  rounded = true,
}: {
  label: string;
  ratio?: string;
  tone?: "slate" | "blue" | "amber" | "orange" | "dark";
  className?: string;
  /** Real image URL (`main_image_url` / `logo_url` / product `image_url`) — renders instead of the placeholder when present. */
  src?: string;
  rounded?: boolean;
}) {
  const toneClasses: Record<string, string> = {
    slate: "from-slate-200 to-slate-100 text-slate-500",
    blue: "from-blue-100 to-blue-50 text-blue-600",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-200",
    orange: "from-orange-100 to-orange-50 text-orange-600",
    dark: "from-slate-800 to-slate-900 text-slate-400",
  };

  if (src) {
    return (
      <div className={cn("w-full overflow-hidden", ratio, rounded && "rounded-xl", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-supplied URL, no remotePatterns config in this stage */}
        <img src={src} alt={label} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full items-center justify-center bg-gradient-to-br",
        ratio,
        rounded && "rounded-xl",
        toneClasses[tone],
        className
      )}
    >
      <span className="px-6 text-center text-sm font-medium tracking-wide">{label}</span>
    </div>
  );
}
