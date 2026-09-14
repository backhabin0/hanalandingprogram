/**
 * Paths the app already uses (or is about to) at the top level — a landing
 * page can never claim one of these as its slug, since it would collide
 * with a real route once Stage 5 serves pages at /[slug].
 */
export const RESERVED_SLUGS = [
  "admin",
  "login",
  "api",
  "preview",
  "sitemap.xml",
  "robots.txt",
  "favicon.ico",
  "_next",
];

const SLUG_PATTERN = /^[a-z0-9-]+$/;
const MAX_SLUG_LENGTH = 80;

/** Returns a Korean error message if invalid, or null if the slug is OK. */
export function validateSlug(rawSlug: string): string | null {
  const slug = rawSlug.trim();

  if (!slug) return "URL(slug)을 입력해주세요.";
  if (slug.length > MAX_SLUG_LENGTH) return `URL(slug)은 ${MAX_SLUG_LENGTH}자 이하로 입력해주세요.`;
  if (!SLUG_PATTERN.test(slug)) {
    return "URL(slug)은 영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.";
  }
  if (RESERVED_SLUGS.includes(slug)) {
    return "이 URL은 시스템에서 사용 중이라 사용할 수 없습니다.";
  }

  return null;
}
