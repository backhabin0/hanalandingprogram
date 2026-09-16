import type { LandingPage } from "@/types/landing";
import { SiteHeader } from "../SiteHeader";
import { Hero } from "../Hero";
import { TrustMetrics } from "../TrustMetrics";
import { ProductSection } from "../ProductSection";
import { FeatureGrid } from "../FeatureGrid";
import { SpecificationTable } from "../SpecificationTable";
import { CaseStudiesSection } from "../CaseStudiesSection";
import { PageGallerySection } from "../PageGallerySection";
import { LocationSection } from "../LocationSection";
import { PricingSection } from "../PricingSection";
import { FAQSection } from "../FAQSection";
import { LeadSection } from "../LeadSection";
import { SiteFooter } from "../SiteFooter";

/**
 * Template B — "제품 판매형" (Product Showcase).
 * For hardware/equipment/package sales and rentals. Dark, high-contrast
 * canvas that leads with the product image and price, not a services pitch.
 */
export function TemplateB({ page }: { page: LandingPage }) {
  const navItems = [
    page.products.length > 0 && { label: "제품", href: "#products" },
    page.features.length > 0 && { label: "장점", href: "#features" },
    page.specifications.length > 0 && { label: "사양", href: "#specifications" },
    (page.representativePrice || page.products.length > 0) && { label: "가격", href: "#pricing" },
    page.faqs.length > 0 && { label: "FAQ", href: "#faq" },
    { label: "문의", href: "#lead" },
  ].filter((item): item is { label: string; href: string } => Boolean(item));

  const heroProduct = page.products[0];

  return (
    <div className="bg-slate-950">
      <SiteHeader
        businessName={page.businessName}
        logoUrl={page.logoUrl}
        navItems={navItems}
        phone={page.phone}
        ctaLabel="지금 구매하기"
        variant="b"
      />

      <main>
        <Hero
          eyebrow={page.industry}
          title={page.heroTitle}
          description={page.heroDescription}
          primaryCta={{ label: "지금 구매하기", href: "#pricing" }}
          secondaryCta={{ label: "제품 살펴보기", href: "#products" }}
          imageLabel={`${page.businessName} 대표 제품 이미지`}
          imageUrl={page.mainImageUrl ?? heroProduct?.image}
          variant="b"
          imagePosition="left"
          priceBadge={
            page.representativePrice?.price
              ? {
                  label: page.representativePrice.label,
                  price: page.representativePrice.price,
                  unit: page.representativePrice.priceUnit,
                }
              : undefined
          }
        />

        <TrustMetrics
          id="highlights"
          eyebrow="제품 하이라이트"
          title="숫자로 보는 신뢰"
          metrics={page.metrics}
          badges={page.trustBadges}
          variant="b"
        />

        <ProductSection
          id="products"
          eyebrow="제품 라인업"
          title={`${page.businessName} 제품 구성`}
          description={page.description}
          products={page.products}
          variant="b"
        />

        <FeatureGrid
          id="features"
          eyebrow="핵심 장점"
          title="이 제품을 선택해야 하는 이유"
          features={page.features}
          variant="b"
        />

        <SpecificationTable
          id="specifications"
          eyebrow="제품 사양"
          title="상세 스펙 안내"
          description="구매 전 꼭 확인해야 할 사양입니다."
          specs={page.specifications}
          variant="b"
        />

        <PricingSection
          id="pricing"
          eyebrow="가격 / 옵션 비교"
          title="필요한 구성을 선택하세요"
          description="패키지별 구성과 가격을 비교해 보고 가장 적합한 옵션을 선택하세요."
          mode="tiers"
          products={page.products}
          variant="b"
        />

        <CaseStudiesSection
          id="cases"
          eyebrow="구매/설치 사례"
          title="실제 도입 사례"
          cases={page.cases ?? []}
          variant="b"
        />

        <PageGallerySection
          id="gallery"
          eyebrow="제품 갤러리"
          title="다양한 각도로 살펴보세요"
          images={page.galleryImages ?? []}
          variant="b"
        />

        <LocationSection
          id="location"
          title="서비스 지역 안내"
          address={page.address}
          region={page.region}
          phone={page.phone}
          kakaoUrl={page.kakaoUrl}
          businessHours={page.companyInfo?.businessHours}
          localityDescription={page.seo?.localityDescription}
          variant="b"
        />

        <FAQSection
          id="faq"
          title="자주 묻는 질문"
          description="구매 전 자주 문의되는 내용을 모았습니다."
          faqs={page.faqs}
          variant="b"
        />

        <LeadSection
          title="구성이 고민되신다면 문의해 주세요"
          description="현장 환경에 맞는 패키지를 추천해 드립니다."
          phone={page.phone}
          kakaoUrl={page.kakaoUrl}
          variant="b"
        />
      </main>

      <SiteFooter
        businessName={page.businessName}
        logoUrl={page.logoUrl}
        industry={page.industry}
        phone={page.phone}
        address={page.address}
        navItems={navItems}
        companyInfo={page.companyInfo}
        variant="b"
      />
    </div>
  );
}
