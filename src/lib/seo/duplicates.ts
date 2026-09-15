import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Cheap, honest duplicate-content signal for the admin's own multi-page set
 * — exact-match comparisons only (no fuzzy/NLP similarity claims). Compares
 * the current page's resolved title, hero title, and primary keyword
 * against every OTHER landing page the admin manages. Never auto-fixes
 * anything — just returns strings to display as warnings.
 */
export async function findDuplicateSeoWarnings(
  landingPageId: string,
  current: { title: string; heroTitle: string; primaryKeyword?: string }
): Promise<string[]> {
  const supabase = await createSupabaseServerClient();

  const { data: otherPages, error } = await supabase
    .from("landing_pages")
    .select("id, business_name, title, hero_title, slug")
    .neq("id", landingPageId);
  if (error || !otherPages || otherPages.length === 0) return [];

  const otherIds = otherPages.map((p) => p.id);
  const { data: otherSeo } = await supabase
    .from("landing_page_seo_settings")
    .select("landing_page_id, seo_title, primary_keyword")
    .in("landing_page_id", otherIds);

  const seoByPageId = new Map((otherSeo ?? []).map((row) => [row.landing_page_id, row]));

  const warnings: string[] = [];
  const normalizedCurrentTitle = current.title.trim();
  const normalizedCurrentHero = current.heroTitle.trim();
  const normalizedCurrentKeyword = current.primaryKeyword?.trim().toLowerCase();

  for (const other of otherPages) {
    const otherSeoRow = seoByPageId.get(other.id);
    const otherResolvedTitle = (otherSeoRow?.seo_title || other.title || "").trim();

    if (normalizedCurrentTitle && otherResolvedTitle && normalizedCurrentTitle === otherResolvedTitle) {
      warnings.push(`"${other.business_name}" 페이지와 SEO 제목이 동일합니다.`);
    }
    if (normalizedCurrentHero && other.hero_title?.trim() === normalizedCurrentHero) {
      warnings.push(`"${other.business_name}" 페이지와 Hero 제목이 동일합니다.`);
    }
    if (normalizedCurrentKeyword && otherSeoRow?.primary_keyword?.trim().toLowerCase() === normalizedCurrentKeyword) {
      warnings.push(`"${other.business_name}" 페이지와 대표 검색어가 동일합니다.`);
    }
  }

  return warnings;
}
