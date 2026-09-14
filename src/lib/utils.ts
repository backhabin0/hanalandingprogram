type ClassValue = string | number | false | null | undefined;

/** Tiny classnames joiner — avoids pulling in clsx for a one-liner. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
