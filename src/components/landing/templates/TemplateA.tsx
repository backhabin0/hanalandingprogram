import type { LandingPage } from "@/types/landing";
import { SiteHeader } from "../SiteHeader";
import { Hero } from "../Hero";
import { TrustMetrics } from "../TrustMetrics";
import { ProductSection } from "../ProductSection";
import { FeatureGrid } from "../FeatureGrid";
import { ProcessSteps } from "../ProcessSteps";
import { PricingSection } from "../PricingSection";
import { FAQSection } from "../FAQSection";
import { LeadSection } from "../LeadSection";
import { SiteFooter } from "../SiteFooter";

const NAV_ITEMS = [
  { label: "서비스", href: "#products" },
  { label: "특징", href: "#features" },
  { label: "프로세스", href: "#process" },
  { label: "가격", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

/**
 * Template A — "기업 서비스형" (Corporate Service).
 * For installation/consulting/B2B technology companies. Leads with trust
 * metrics and a clear adoption process ahead of the pricing/estimate ask.
 */
export function TemplateA({ page }: { page: LandingPage }) {
  return (
    <div className="bg-white">
      <SiteHeader
        businessName={page.businessName}
        navItems={NAV_ITEMS}
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
          secondaryCta={{ label: "서비스 살펴보기", href: "#products" }}
          imageLabel={`${page.businessName} 현장 이미지`}
          variant="a"
        />

        <TrustMetrics metrics={page.metrics} badges={page.trustBadges} variant="a" />

        <ProductSection
          id="products"
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
          title="상담부터 사후관리까지, 4단계로 진행됩니다"
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

        <FAQSection
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
          variant="a"
        />
      </main>

      <SiteFooter
        businessName={page.businessName}
        industry={page.industry}
        phone={page.phone}
        address={page.address}
        companyInfo={page.companyInfo}
        variant="a"
      />
    </div>
  );
}
