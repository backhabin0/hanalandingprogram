import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { LandingPageForm } from "@/components/admin/LandingPageForm";
import { getLandingPageById, getLandingFeatures, getLandingProducts } from "@/lib/landing-pages";
import { updateLandingPageAction } from "../../actions";

export default async function EditLandingPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const page = await getLandingPageById(id);
  if (!page) notFound();

  const [products, features] = await Promise.all([getLandingProducts(id), getLandingFeatures(id)]);

  const boundUpdate = updateLandingPageAction.bind(null, id);

  return (
    <div>
      <PageHeader title={`${page.businessName} 수정`} description={`/${page.slug}`} />
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
          products,
          features,
        }}
      />
    </div>
  );
}
