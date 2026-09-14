const ALLOWED_URL_PROTOCOLS = new Set(["http:", "https:"]);

/** Rejects javascript:, data:, file:, and anything else that isn't http(s). */
export function isSafeHttpUrl(value: string): boolean {
  try {
    return ALLOWED_URL_PROTOCOLS.has(new URL(value).protocol);
  } catch {
    return false;
  }
}
