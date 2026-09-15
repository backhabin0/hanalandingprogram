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
import { getTemplateMeta } from "@/lib/mock-data";
import {
  getLandingCompanyInfo,
  getLandingFaqs,
  getLandingFeatures,
  getLandingMetrics,
  getLandingPageById,
  getLandingProcessSteps,
  getLandingProducts,
  getLandingSpecifications,
} from "@/lib/landing-pages";
import { updateLandingPageAction } from "../../actions";

export default async function EditLandingPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const page = await getLandingPageById(id);
  if (!page) notFound();

  const [products, features, metrics, specifications, faqs, processSteps, companyInfo] = await Promise.all([
    getLandingProducts(id),
    getLandingFeatures(id),
    getLandingMetrics(id),
    getLandingSpecifications(id),
    getLandingFaqs(id),
    getLandingProcessSteps(id),
    getLandingCompanyInfo(id),
  ]);

  const boundUpdate = updateLandingPageAction.bind(null, id);
  const template = getTemplateMeta(page.template);

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
          }}
        />

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
        <CompanyInfoEditor landingPageId={id} initialCompanyInfo={companyInfo ?? undefined} />
      </div>
    </div>
  );
}
