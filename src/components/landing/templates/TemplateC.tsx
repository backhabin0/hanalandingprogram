import type { LandingPage } from "@/types/landing";
import { SiteHeader } from "../SiteHeader";
import { Hero } from "../Hero";
import { FeatureGrid } from "../FeatureGrid";
import { ProductSection } from "../ProductSection";
import { PricingSection } from "../PricingSection";
import { ProcessSteps } from "../ProcessSteps";
import { LocationSection } from "../LocationSection";
import { CaseStudiesSection } from "../CaseStudiesSection";
import { TrustMetrics } from "../TrustMetrics";
import { FAQSection } from "../FAQSection";
import { LeadSection } from "../LeadSection";
import { SiteFooter } from "../SiteFooter";

/**
 * Template C — "지역 서비스 상담전환형" (Local Consultation).
 * For clinics, gyms, beauty, academies, and other locally-anchored service
 * businesses. Warm neutral tone, people-first copy, consultation-driven CTA.
 */
export function TemplateC({ page }: { page: LandingPage }) {
  const navItems = [
    page.features.length > 0 && { label: "이용 혜택", href: "#features" },
    page.products.length > 0 && { label: "서비스 소개", href: "#services" },
    page.representativePrice && { label: "가격 안내", href: "#pricing" },
    (page.address || page.region) && { label: "오시는 길", href: "#location" },
    page.faqs.length > 0 && { label: "FAQ", href: "#faq" },
    { label: "상담", href: "#lead" },
  ].filter((item): item is { label: string; href: string } => Boolean(item));

  const facts = [
    page.region && { label: "지역", value: page.region },
    page.phone && { label: "전화", value: page.phone },
    page.companyInfo?.businessHours && { label: "영업시간", value: page.companyInfo.businessHours },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact));

  return (
    <div className="bg-white">
      <SiteHeader
        businessName={page.businessName}
        navItems={navItems}
        phone={page.phone}
        ctaLabel="상담 예약하기"
        variant="c"
      />

      <main>
        <Hero
          eyebrow={page.industry}
          title={page.heroTitle}
          description={page.heroDescription}
          primaryCta={{ label: "상담 예약하기", href: "#lead" }}
          secondaryCta={{ label: "서비스 둘러보기", href: "#services" }}
          imageLabel={`${page.businessName} 대표 이미지`}
          imageUrl={page.mainImageUrl}
          variant="c"
          facts={facts.length > 0 ? facts : undefined}
        />

        <FeatureGrid
          id="features"
          eyebrow="이용 혜택"
          title="이용 고객이 꼽는 이유"
          features={page.features}
          variant="c"
        />

        <ProductSection
          id="services"
          eyebrow="서비스 소개"
          title={`${page.businessName}의 서비스`}
          description={page.description}
          products={page.products}
          variant="c"
        />

        <PricingSection
          id="pricing"
          eyebrow="가격 안내"
          title="비용이 궁금하신가요?"
          description="정확한 비용은 상담을 통해 개인별로 안내드립니다."
          mode="summary"
          summary={page.representativePrice}
          variant="c"
        />

        <ProcessSteps
          id="process"
          eyebrow="상담 절차"
          title="이렇게 진행됩니다"
          steps={page.processSteps}
          variant="c"
          layout="vertical"
        />

        <LocationSection
          id="location"
          title="오시는 길"
          description="아래 정보를 확인하시고 편하게 방문해 주세요."
          address={page.address}
          region={page.region}
          phone={page.phone}
          kakaoUrl={page.kakaoUrl}
          businessHours={page.companyInfo?.businessHours}
          localityDescription={page.seo?.localityDescription}
          variant="c"
        />

        <CaseStudiesSection
          id="cases"
          eyebrow="이용 사례"
          title="실제 이용 사례"
          cases={page.cases ?? []}
          variant="c"
        />

        <TrustMetrics
          id="metrics"
          eyebrow="누적 실적"
          title="숫자로 보는 신뢰"
          metrics={page.metrics}
          badges={page.trustBadges}
          variant="c"
        />

        <FAQSection
          id="faq"
          title="자주 묻는 질문"
          description="상담 전 자주 궁금해하시는 내용을 모았습니다."
          faqs={page.faqs}
          variant="c"
        />

        <LeadSection
          title="편하게 상담 받아보세요"
          description="부담 없이 문의 남겨주시면 순차적으로 연락드립니다."
          phone={page.phone}
          kakaoUrl={page.kakaoUrl}
          variant="c"
        />
      </main>

      <SiteFooter
        businessName={page.businessName}
        industry={page.industry}
        phone={page.phone}
        address={page.address}
        navItems={navItems}
        companyInfo={page.companyInfo}
        variant="c"
      />
    </div>
  );
}
