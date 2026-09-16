import type { LandingPage } from "@/types/landing";
import { SiteHeader } from "../SiteHeader";
import { Hero } from "../Hero";
import { TrustMetrics } from "../TrustMetrics";
import { ProductSection } from "../ProductSection";
import { FeatureGrid } from "../FeatureGrid";
import { ProcessSteps } from "../ProcessSteps";
import { PricingSection } from "../PricingSection";
import { SpecificationTable } from "../SpecificationTable";
import { CaseStudiesSection } from "../CaseStudiesSection";
import { PageGallerySection } from "../PageGallerySection";
import { LocationSection } from "../LocationSection";
import { FAQSection } from "../FAQSection";
import { LeadSection } from "../LeadSection";
import { SiteFooter } from "../SiteFooter";

/**
 * Template A — "기업 서비스형" (Corporate Service).
 * For installation/consulting/B2B technology companies. Leads with trust
 * metrics and a clear adoption process ahead of the pricing/estimate ask.
 */
export function TemplateA({ page }: { page: LandingPage }) {
  const navItems = [
    page.products.length > 0 && { label: "서비스", href: "#services" },
    page.features.length > 0 && { label: "특징", href: "#features" },
    (page.representativePrice || page.specifications.length > 0) && { label: "가격", href: "#pricing" },
    page.faqs.length > 0 && { label: "FAQ", href: "#faq" },
    { label: "문의", href: "#lead" },
  ].filter((item): item is { label: string; href: string } => Boolean(item));

  return (
    <div className="bg-white">
      <SiteHeader
        businessName={page.businessName}
        logoUrl={page.logoUrl}
        navItems={navItems}
        phone={page.phone}
        ctaLabel="무료 견적 받기"
        variant="a"
      />

      <main>
        <Hero
          eyebrow={page.industry}
          title={page.heroTitle}
          description={page.heroDescription}
          primaryCta={{ label: "무료 견적 받기", href: "#lead" }}
          secondaryCta={{ label: "서비스 살펴보기", href: "#services" }}
          imageLabel={`${page.businessName} 현장 이미지`}
          imageUrl={page.mainImageUrl}
          variant="a"
        />

        <TrustMetrics metrics={page.metrics} badges={page.trustBadges} variant="a" />

        <ProductSection
          id="services"
          eyebrow="서비스 안내"
          title={`${page.businessName}가 제공하는 서비스`}
          description={page.description}
          products={page.products}
          variant="a"
        />

        <FeatureGrid
          id="features"
          eyebrow="핵심 특징"
          title="왜 이 서비스를 선택해야 할까요"
          description="현장에서 검증된 기술력과 대응 체계로 안심하고 맡길 수 있습니다."
          features={page.features}
          variant="a"
        />

        <ProcessSteps
          id="process"
          eyebrow="도입 프로세스"
          title="상담부터 사후관리까지, 체계적으로 진행됩니다"
          steps={page.processSteps}
          variant="a"
        />

        <PricingSection
          id="pricing"
          eyebrow="가격 안내"
          title="정확한 비용이 궁금하신가요?"
          description="현장 환경에 따라 구성이 달라지므로, 무료 실측 후 정식 견적서를 제공합니다."
          mode="summary"
          summary={page.representativePrice}
          variant="a"
        />

        <SpecificationTable
          id="specifications"
          eyebrow="기술 사양"
          title="표준 사양 안내"
          description="구성 요소별 기본 사양입니다. 현장 조건에 따라 별도 옵션을 제안할 수 있습니다."
          specs={page.specifications}
          variant="a"
        />

        <CaseStudiesSection
          id="cases"
          eyebrow="시공 사례"
          title="실제 설치·시공 사례"
          cases={page.cases ?? []}
          variant="a"
        />

        <PageGallerySection
          id="gallery"
          eyebrow="현장 갤러리"
          title="시공 현장 및 실적 사진"
          images={page.galleryImages ?? []}
          variant="a"
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
          variant="a"
        />

        <FAQSection
          id="faq"
          title="자주 묻는 질문"
          description={`${page.businessName} 도입을 고려 중이신 분들이 가장 많이 묻는 질문을 모았습니다.`}
          faqs={page.faqs}
          variant="a"
        />

        <LeadSection
          title="지금 바로 무료 상담을 받아보세요"
          description="현장 실측부터 견적까지, 부담 없이 문의해 주세요."
          phone={page.phone}
          kakaoUrl={page.kakaoUrl}
          slug={page.slug}
          products={page.products}
          defaultInquiryType="quote"
          variant="a"
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
        variant="a"
      />
    </div>
  );
}
