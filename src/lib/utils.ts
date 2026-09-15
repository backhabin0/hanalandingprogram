type ClassValue = string | number | false | null | undefined;

/** Tiny classnames joiner — avoids pulling in clsx for a one-liner. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Builds a safe `tel:` href from however the phone number was typed in the
 * admin form (e.g. "010-1234-5678", "1588 0000"). Keeps only digits and a
 * leading "+", since a raw `tel:${phone}` href would carry spaces/dashes
 * straight into the URI.
 */
export function toTelHref(phone: string): string {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/[^\d]/g, "");
  return `tel:${trimmed.startsWith("+") ? "+" : ""}${digits}`;
}
