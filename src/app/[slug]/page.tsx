import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicLandingPageFullBySlug } from "@/lib/public-landing-pages";
import { resolveLandingPageSeo } from "@/lib/seo/resolve";
import { LandingPageRenderer } from "@/components/landing/LandingPageRenderer";

/**
 * Real customer landing pages, served straight from the DB. Admin edits a
 * page and flips it to public — the very next request here must show it,
 * so this route intentionally never opts into static/ISR caching.
 */
export const dynamic = "force-dynamic";

type PublicLandingPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PublicLandingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublicLandingPageFullBySlug(slug);

  if (!page) {
    return {
      robots: { index: false, follow: false },
    };
  }

  const seo = resolveLandingPageSeo(page);

  return {
    // `title.absolute` bypasses the root layout's "%s | Hana LP Studio"
    // template — a customer's public page must not carry this CMS's own
    // branding suffix in its search-result title.
    title: { absolute: seo.title },
    description: seo.description,
    alternates: { canonical: seo.canonical },
    robots: seo.robots,
    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      url: seo.canonical,
      type: "website",
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
    },
    twitter: {
      card: seo.twitterCard,
      title: seo.ogTitle,
      description: seo.ogDescription,
      images: seo.ogImage ? [seo.ogImage] : undefined,
    },
  };
}

export default async function PublicLandingPage({ params }: PublicLandingPageProps) {
  const { slug } = await params;
  const page = await getPublicLandingPageFullBySlug(slug);

  if (!page) {
    notFound();
  }

  return <LandingPageRenderer page={page} />;
}
