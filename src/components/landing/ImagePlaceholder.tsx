"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Stand-in for real photography/product imagery, and the actual renderer
 * for every real image in the app (`main_image_url` / `logo_url` / product
 * `image_url` / gallery images / ...). Falls back to the placeholder box —
 * never a browser broken-image icon — if `src` fails to load (a deleted
 * Storage object, a stale/incorrect external URL, ...). "use client" only
 * for that `onError` handler; it's a small, self-contained leaf so this
 * doesn't turn any Server Component tree above it into client code.
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
  /** Real image URL — renders instead of the placeholder when present and loadable. */
  src?: string;
  rounded?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  // Reset the broken-image fallback when `src` itself changes (e.g. after an
  // upload replaces the URL) — otherwise a once-broken image would stay
  // stuck on the placeholder even after a valid new URL arrives.
  const [lastSrc, setLastSrc] = useState(src);
  if (src !== lastSrc) {
    setLastSrc(src);
    setFailed(false);
  }

  const toneClasses: Record<string, string> = {
    slate: "from-slate-200 to-slate-100 text-slate-500",
    blue: "from-blue-100 to-blue-50 text-blue-600",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-200",
    orange: "from-orange-100 to-orange-50 text-orange-600",
    dark: "from-slate-800 to-slate-900 text-slate-400",
  };

  if (src && !failed) {
    return (
      <div className={cn("w-full overflow-hidden", ratio, rounded && "rounded-xl", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-supplied/Storage URL, no fixed remotePatterns host set for this stage */}
        <img src={src} alt={label} className="h-full w-full object-cover" onError={() => setFailed(true)} />
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
