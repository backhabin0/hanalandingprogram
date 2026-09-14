import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-sm",
        padded && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  description,
  tone = "default",
}: {
  label: string;
  value: string | number;
  description?: string;
  tone?: "default" | "blue" | "green" | "amber";
}) {
  const toneClasses: Record<string, string> = {
    default: "text-slate-900",
    blue: "text-blue-600",
    green: "text-emerald-600",
    amber: "text-amber-600",
  };

  return (
    <Card>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={cn("mt-2 text-3xl font-semibold tracking-tight", toneClasses[tone])}>
        {value}
      </p>
      {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
    </Card>
  );
}
