import type { LandingPage, LandingSeoMeta } from "@/types/landing";
import { resolveLandingPageSeo } from "./resolve";

export interface SeoScoreItem {
  key: string;
  label: string;
  points: number;
  maxPoints: number;
  suggestion?: string;
}

export interface SeoScoreResult {
  /** Raw sum of every item's points, out of `maxRawTotal`. */
  rawTotal: number;
  maxRawTotal: number;
  /** rawTotal/maxRawTotal rounded onto a 0-100 scale, for display only. */
  displayScore: number;
  items: SeoScoreItem[];
  /** One line per item that isn't at max, in the same order as `items`. */
  suggestions: string[];
}

const RICH_DESCRIPTION_LENGTH = 80;
const RICH_HERO_LENGTH = 40;

/**
 * A page-completeness checklist, NOT a search-ranking score — every UI that
 * renders this must say so explicitly (see SeoScoreCard). Points are tiered
 * for the handful of fields where "just filled in" and "actually useful"
 * are meaningfully different (company description, product description,
 * FAQ count, feature count) rather than rewarding raw character counts —
 * see the Stage 8 report for why a flat length threshold isn't used
 * everywhere.
 */
export function computeSeoScore(page: LandingPage, seo: LandingSeoMeta | undefined): SeoScoreResult {
  const resolved = resolveLandingPageSeo({
    slug: page.slug,
    businessName: page.businessName,
    title: page.title,
    heroTitle: page.heroTitle,
    heroDescription: page.heroDescription,
    description: page.description,
    region: page.region,
    industry: page.industry,
    mainImageUrl: page.mainImageUrl,
    logoUrl: page.logoUrl,
    updatedAt: page.updatedAt,
    products: page.products,
    seo,
  });
  const activeProducts = page.products.filter((p) => p.isActive !== false);
  const activeFeatures = page.features.filter((f) => f.isActive !== false);
  const activeFaqs = page.faqs.filter((f) => f.isActive !== false);
  const activeSpecs = page.specifications.filter((s) => s.isActive !== false);

  const items: SeoScoreItem[] = [];

  const hasRichTitle = Boolean([page.region, page.industry].filter(Boolean).length || seo?.metaTitle);
  items.push({
    key: "title",
    label: "SEO 제목",
    points: hasRichTitle ? 8 : resolved.title ? 3 : 0,
    maxPoints: 8,
    suggestion: "지역/업종 정보를 채우거나 SEO 제목을 직접 입력하면 더 구체적인 제목이 만들어집니다.",
  });

  const hasRichDescription = Boolean(seo?.metaDescription || page.description || page.heroDescription);
  items.push({
    key: "description",
    label: "Meta 설명",
    points: hasRichDescription ? 8 : 3,
    maxPoints: 8,
    suggestion: "업체 소개(About) 또는 Hero 설명을 작성하면 검색 설명이 더 명확해집니다.",
  });

  items.push({
    key: "hero",
    label: "Hero 제목(H1)",
    points: page.heroTitle ? 5 : 0,
    maxPoints: 5,
    suggestion: "Hero 제목을 입력해주세요.",
  });

  items.push({
    key: "industry",
    label: "업종 정보",
    points: page.industry ? 6 : 0,
    maxPoints: 6,
    suggestion: "업종을 입력하면 검색 의도와 매칭되기 쉬워집니다.",
  });

  items.push({
    key: "region",
    label: "지역 정보",
    points: page.region ? 6 : 0,
    maxPoints: 6,
    suggestion: "지역(예: 전주)을 입력하면 지역 검색 노출에 도움이 됩니다.",
  });

  items.push({
    key: "serviceArea",
    label: "서비스 지역",
    points: seo?.serviceArea || page.address ? 6 : 0,
    maxPoints: 6,
    suggestion: "SEO 설정에서 서비스 지역을 입력해주세요.",
  });

  const descriptionLength = (page.description ?? "").length;
  items.push({
    key: "aboutQuality",
    label: "업체 설명 충분",
    points: descriptionLength >= RICH_DESCRIPTION_LENGTH ? 8 : descriptionLength > 0 ? 4 : 0,
    maxPoints: 8,
    suggestion: "업체 소개를 충분히 작성해보세요 (현재보다 더 구체적으로).",
  });

  items.push({
    key: "productsExist",
    label: "제품/서비스 1개 이상",
    points: activeProducts.length >= 1 ? 7 : 0,
    maxPoints: 7,
    suggestion: "제품/서비스를 1개 이상 등록해주세요.",
  });

  const bestProductDescriptionLength = Math.max(0, ...activeProducts.map((p) => (p.description ?? "").length));
  items.push({
    key: "productDescriptionQuality",
    label: "제품 상세 설명 충분",
    points: bestProductDescriptionLength >= RICH_DESCRIPTION_LENGTH ? 8 : bestProductDescriptionLength > 0 ? 4 : 0,
    maxPoints: 8,
    suggestion: "제품 상세 설명을 더 구체적으로 작성해보세요.",
  });

  const hasPriceInfo = Boolean(page.representativePrice?.price) || activeProducts.some((p) => p.price);
  items.push({
    key: "price",
    label: "대표/제품 가격 정보",
    points: hasPriceInfo ? 6 : 0,
    maxPoints: 6,
    suggestion: "가격 정보를 추가하세요.",
  });

  items.push({
    key: "features",
    label: "핵심 특징 3개 이상",
    points: activeFeatures.length >= 3 ? 5 : activeFeatures.length >= 1 ? 3 : 0,
    maxPoints: 5,
    suggestion: "핵심 특징을 3개 이상 작성해보세요.",
  });

  items.push({
    key: "specifications",
    label: "제품 사양 존재",
    points: activeSpecs.length >= 1 ? 5 : 0,
    maxPoints: 5,
    suggestion: "제품 사양을 추가하세요.",
  });

  items.push({
    key: "faqs",
    label: "FAQ 3개 이상",
    points: activeFaqs.length >= 3 ? 7 : activeFaqs.length >= 1 ? 4 : 0,
    maxPoints: 7,
    suggestion: "FAQ를 3개 이상 작성해보세요.",
  });

  items.push({
    key: "companyInfo",
    label: "회사 정보",
    points: page.companyInfo?.companyName || page.companyInfo?.representative ? 5 : 0,
    maxPoints: 5,
    suggestion: "회사 정보(상호/대표자)를 입력해주세요.",
  });

  items.push({
    key: "phone",
    label: "전화/연락처",
    points: page.phone ? 4 : 0,
    maxPoints: 4,
    suggestion: "전화번호를 입력해주세요.",
  });

  const hasTrackRecord = page.metrics.filter((m) => m.isActive !== false).length > 0 || page.processSteps.length > 0;
  items.push({
    key: "trackRecord",
    label: "실적 또는 진행 과정",
    points: hasTrackRecord ? 4 : 0,
    maxPoints: 4,
    suggestion: "실적(숫자) 또는 진행 과정을 추가하세요.",
  });

  const heroLength = (page.heroDescription ?? "").length;
  const uniqueContentScore =
    heroLength >= RICH_HERO_LENGTH && descriptionLength >= RICH_DESCRIPTION_LENGTH
      ? 6
      : heroLength >= RICH_HERO_LENGTH || descriptionLength >= RICH_DESCRIPTION_LENGTH
        ? 3
        : 0;
  // Low weight on purpose — a completeness nudge, not a reward for merely
  // uploading a file. Real content (description/price/FAQ/etc. above) still
  // dominates the score.
  const hasRepresentativeImage = Boolean(page.mainImageUrl) || activeProducts.some((p) => p.image);
  const hasOgImage = Boolean(seo?.ogImageUrl || page.mainImageUrl || page.logoUrl);
  items.push({
    key: "images",
    label: "대표/OG 이미지 존재",
    points: hasRepresentativeImage && hasOgImage ? 3 : hasRepresentativeImage || hasOgImage ? 1 : 0,
    maxPoints: 3,
    suggestion: "Hero(대표) 이미지와 OG 공유 이미지를 등록해보세요.",
  });

  items.push({
    key: "uniqueContent",
    label: "고유 콘텐츠 품질",
    points: uniqueContentScore,
    maxPoints: 6,
    suggestion: "Hero 설명과 업체 소개를 더 구체적이고 고유하게 작성해보세요.",
  });

  const rawTotal = items.reduce((sum, item) => sum + item.points, 0);
  const maxRawTotal = items.reduce((sum, item) => sum + item.maxPoints, 0);
  const displayScore = maxRawTotal > 0 ? Math.round((rawTotal / maxRawTotal) * 100) : 0;
  const suggestions = items.filter((item) => item.points < item.maxPoints && item.suggestion).map((item) => item.suggestion as string);

  return { rawTotal, maxRawTotal, displayScore, items, suggestions };
}
