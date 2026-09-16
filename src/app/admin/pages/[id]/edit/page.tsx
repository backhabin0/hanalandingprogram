import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { PageStatusBadge } from "@/components/admin/StatusBadge";
import { LandingPageForm } from "@/components/admin/LandingPageForm";
import { ProductsEditor } from "@/components/admin/ProductsEditor";
import { FeaturesEditor } from "@/components/admin/FeaturesEditor";
import { MetricsEditor } from "@/components/admin/MetricsEditor";
import { SpecificationsEditor } from "@/components/admin/SpecificationsEditor";
import { ProcessStepsEditor } from "@/components/admin/ProcessStepsEditor";
import { FaqEditor } from "@/components/admin/FaqEditor";
import { CompanyInfoEditor } from "@/components/admin/CompanyInfoEditor";
import { CasesEditor } from "@/components/admin/CasesEditor";
import { SeoEditor } from "@/components/admin/SeoEditor";
import { SeoScoreCard } from "@/components/admin/SeoScoreCard";
import { PageGalleryEditor } from "@/components/admin/PageGalleryEditor";
import { getTemplateMeta } from "@/lib/mock-data";
import {
  getLandingCases,
  getLandingCompanyInfo,
  getLandingFaqs,
  getLandingFeatures,
  getLandingMetrics,
  getLandingPageById,
  getLandingPageGalleryImages,
  getLandingPageSeoSettings,
  getLandingProcessSteps,
  getLandingProductImages,
  getLandingProducts,
  getLandingSpecifications,
} from "@/lib/landing-pages";
import { resolveLandingPageSeo } from "@/lib/seo/resolve";
import { computeSeoScore } from "@/lib/seo/score";
import { findDuplicateSeoWarnings } from "@/lib/seo/duplicates";
import type { LandingPage, LandingProduct } from "@/types/landing";
import { updateLandingPageAction } from "../../actions";

export default async function EditLandingPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const page = await getLandingPageById(id);
  if (!page) notFound();

  const [
    rawProducts,
    features,
    metrics,
    specifications,
    faqs,
    processSteps,
    companyInfo,
    seo,
    cases,
    productImagesByProductId,
    galleryImages,
  ] = await Promise.all([
    getLandingProducts(id),
    getLandingFeatures(id),
    getLandingMetrics(id),
    getLandingSpecifications(id),
    getLandingFaqs(id),
    getLandingProcessSteps(id),
    getLandingCompanyInfo(id),
    getLandingPageSeoSettings(id),
    getLandingCases(id),
    getLandingProductImages(id),
    getLandingPageGalleryImages(id),
  ]);

  const products: LandingProduct[] = rawProducts.map((product) => ({
    ...product,
    images: productImagesByProductId[product.id] ?? [],
  }));

  const boundUpdate = updateLandingPageAction.bind(null, id);
  const template = getTemplateMeta(page.template);

  // Assembled once here, from data already fetched for the editors above —
  // no extra DB round-trip just to compute the SEO preview/score.
  const fullPage: LandingPage = {
    ...page,
    products,
    features,
    metrics,
    specifications,
    faqs,
    processSteps,
    cases,
    galleryImages,
    companyInfo: companyInfo ?? undefined,
    seo: seo ?? undefined,
  };

  const resolvedSeo = resolveLandingPageSeo(fullPage);
  const score = computeSeoScore(fullPage, seo ?? undefined);
  const duplicateWarnings = await findDuplicateSeoWarnings(id, {
    title: resolvedSeo.title,
    heroTitle: page.heroTitle,
    primaryKeyword: seo?.primaryKeyword,
  });

  return (
    <div>
      <PageHeader
        title={`${page.businessName} 콘텐츠 편집`}
        description={`/${page.slug}`}
        actions={
          <div className="flex items-center gap-2">
            <PageStatusBadge status={page.status} />
            {template && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {template.name}
              </span>
            )}
            {page.status === "public" ? (
              <Link
                href={`/${page.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                공개 페이지 보기
              </Link>
            ) : (
              <span className="rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-400">
                현재 비공개
              </span>
            )}
          </div>
        }
      />

      <div className="space-y-6">
        <LandingPageForm
          mode="edit"
          action={boundUpdate}
          landingPageId={id}
          initialValues={{
            businessName: page.businessName,
            title: page.title,
            slug: page.slug,
            heroTitle: page.heroTitle,
            heroDescription: page.heroDescription,
            description: page.description,
            phone: page.phone,
            kakaoUrl: page.kakaoUrl,
            address: page.address,
            region: page.region,
            industry: page.industry,
            representativePrice: page.representativePrice,
            template: page.template,
            status: page.status,
            logoUrl: page.logoUrl,
            mainImageUrl: page.mainImageUrl,
          }}
        />

        <SeoScoreCard score={score} duplicateWarnings={duplicateWarnings} />

        <ProductsEditor landingPageId={id} initialProducts={products} />
        <FeaturesEditor landingPageId={id} initialFeatures={features} />
        <MetricsEditor landingPageId={id} initialMetrics={metrics} />
        <SpecificationsEditor
          landingPageId={id}
          initialSpecifications={specifications}
          products={products.map((p) => ({ id: p.id, name: p.name }))}
        />
        <ProcessStepsEditor landingPageId={id} initialSteps={processSteps} />
        <FaqEditor landingPageId={id} initialFaqs={faqs} />
        <CasesEditor
          landingPageId={id}
          initialCases={cases}
          products={products.map((p) => ({ id: p.id, name: p.name }))}
        />
        <CompanyInfoEditor landingPageId={id} initialCompanyInfo={companyInfo ?? undefined} />
        <PageGalleryEditor landingPageId={id} initialImages={galleryImages} fallbackAlt={page.businessName} />
        <SeoEditor
          landingPageId={id}
          initialSeo={seo ?? undefined}
          autoTitle={resolvedSeo.autoTitle}
          autoDescription={resolvedSeo.autoDescription}
        />
      </div>
    </div>
  );
}
