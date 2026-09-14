import type { LandingPage } from "@/types/landing";
import { SiteHeader } from "../SiteHeader";
import { Hero } from "../Hero";
import { ProductSection } from "../ProductSection";
import { FeatureGrid } from "../FeatureGrid";
import { PricingSection } from "../PricingSection";
import { LocationSection } from "../LocationSection";
import { FAQSection } from "../FAQSection";
import { LeadSection } from "../LeadSection";
import { SiteFooter } from "../SiteFooter";

const NAV_ITEMS = [
  { label: "서비스 소개", href: "#products" },
  { label: "이용 혜택", href: "#features" },
  { label: "가격 안내", href: "#pricing" },
  { label: "오시는 길", href: "#location" },
  { label: "FAQ", href: "#faq" },
];

/**
 * Template C — "지역 서비스 상담전환형" (Local Consultation).
 * For clinics, gyms, beauty, academies, and other locally-anchored service
 * businesses. Warm neutral tone, people-first copy, consultation-driven CTA.
 */
export function TemplateC({ page }: { page: LandingPage }) {
  return (
    <div className="bg-white">
      <SiteHeader
        businessName={page.businessName}
        navItems={NAV_ITEMS}
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
          secondaryCta={{ label: "서비스 둘러보기", href: "#products" }}
          imageLabel={`${page.businessName} 대표 이미지`}
          variant="c"
        />

        <ProductSection
          id="products"
          eyebrow="서비스 소개"
          title={`${page.businessName}의 서비스`}
          description={page.description}
          products={page.products}
          variant="c"
        />

        <FeatureGrid
          id="features"
          eyebrow="이용 혜택"
          title="이용 고객이 꼽는 이유"
          features={page.features}
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

        <LocationSection
          id="location"
          title="오시는 길"
          description="아래 정보를 확인하시고 편하게 방문해 주세요."
          address={page.address}
          region={page.region}
          phone={page.phone}
          kakaoUrl={page.kakaoUrl}
          variant="c"
        />

        <FAQSection
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
        companyInfo={page.companyInfo}
        variant="c"
      />
    </div>
  );
}
