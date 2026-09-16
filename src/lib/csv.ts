/**
 * Minimal CSV builder for admin exports (currently just consultations).
 * Every field goes through `csvField`, which does two independent things:
 *
 *   1. RFC 4180 escaping — a field containing a comma, double quote, or
 *      newline gets wrapped in quotes (with internal quotes doubled).
 *   2. Formula-injection defense — a field starting with `=`, `+`, `-`, or
 *      `@` is prefixed with `'` so Excel/Sheets renders it as literal text
 *      instead of evaluating it as a formula. This matters because every
 *      column here can contain raw customer input (name, message, ...).
 */
function csvField(value: string): string {
  let field = /^[=+\-@]/.test(value) ? `'${value}` : value;
  if (/[",\r\n]/.test(field)) {
    field = `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export function toCsv(rows: string[][]): string {
  return rows.map((row) => row.map(csvField).join(",")).join("\r\n");
}
