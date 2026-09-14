import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const baseFieldClass =
  "block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(baseFieldClass, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(baseFieldClass, "resize-y", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select className={cn(baseFieldClass, "bg-white", className)} {...props}>
      {children}
    </select>
  );
}
