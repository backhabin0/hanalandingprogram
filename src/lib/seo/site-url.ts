/**
 * Canonical/OG absolute-URL base. Never hardcode a domain here or anywhere
 * else — the production domain (hanapage.co.kr) is configured entirely via
 * `NEXT_PUBLIC_SITE_URL`, so every caller that needs an absolute URL goes
 * through this.
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  return "http://localhost:3000";
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
