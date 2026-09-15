/**
 * Diffs a desired list of child rows (each optionally carrying its DB `id`)
 * against the ids currently in the DB for the same parent, and reports what
 * needs to change.
 *
 * A row without an `id` is new. A DB id that no longer appears in `desired`
 * has been removed by the admin (deleted, or its only required field was
 * cleared — see each resource's parser). This is the stable-id alternative
 * to Stage 4's delete-everything-then-reinsert approach: existing rows keep
 * their id across saves, which matters once something else (e.g.
 * `landing_specifications.product_id`) references that id by foreign key.
 */
export function diffChildRows<T extends { id?: string }>(
  desired: T[],
  existingIds: string[]
): { toInsert: Omit<T, "id">[]; toUpdate: (T & { id: string })[]; toDeleteIds: string[] } {
  const desiredIds = new Set<string>();
  const toUpdate: (T & { id: string })[] = [];
  const toInsert: Omit<T, "id">[] = [];

  for (const row of desired) {
    if (row.id) {
      desiredIds.add(row.id);
      toUpdate.push(row as T & { id: string });
    } else {
      // Omit `id` entirely rather than leaving it `undefined` — Supabase-js
      // serializes an `undefined`-valued key as SQL NULL, not "column not
      // provided", which fails the NOT NULL constraint instead of letting
      // `default gen_random_uuid()` apply.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _unused, ...rest } = row;
      toInsert.push(rest);
    }
  }

  const toDeleteIds = existingIds.filter((id) => !desiredIds.has(id));
  return { toInsert, toUpdate, toDeleteIds };
}
