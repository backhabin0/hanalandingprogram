/**
 * Shared `FormData` parsing helpers for admin Server Actions.
 * Originally lived only in `src/app/admin/pages/actions.ts`; pulled out here
 * once Stage 7 added several more child-table editors that need the same
 * indexed-field-group parsing (`products[0].name`, `faqs[2].answer`, ...).
 */

export function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function toNullable(value: string): string | null {
  return value === "" ? null : value;
}

/**
 * Reads indexed, dotted field groups out of FormData —
 * `products[0].name`, `products[0].shortDescription`, etc — back into an
 * ordered array of `{ name: "...", shortDescription: "..." }` objects.
 * Checkbox fields (e.g. `products[0].isActive`) are included as `"on"` when
 * checked and simply absent otherwise — callers should treat a missing key
 * as unchecked/false.
 */
export function parseIndexedGroups(formData: FormData, prefix: string): Record<string, string>[] {
  const pattern = new RegExp(`^${prefix}\\[(\\d+)\\]\\.(\\w+)$`);
  const groups = new Map<number, Record<string, string>>();

  for (const [key, value] of formData.entries()) {
    const match = pattern.exec(key);
    if (!match || typeof value !== "string") continue;

    const index = Number(match[1]);
    const field = match[2];
    if (!groups.has(index)) groups.set(index, {});
    groups.get(index)![field] = value.trim();
  }

  return Array.from(groups.keys())
    .sort((a, b) => a - b)
    .map((index) => groups.get(index)!);
}
