import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicLandingPageFullBySlug } from "@/lib/public-landing-pages";
import { LandingPageRenderer } from "@/components/landing/LandingPageRenderer";

/**
 * Real customer landing pages, served straight from the DB. Admin edits a
 * page and flips it to public — the very next request here must show it,
 * so this route intentionally never opts into static/ISR caching (Stage 9
 * adds real SEO; this stays force-dynamic until then).
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

  return {
    title: page.title || page.heroTitle,
    description: page.description || page.heroDescription || `${page.businessName} 공식 안내 페이지`,
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
