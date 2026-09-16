import type { LandingPage, LandingTemplateId } from "@/types/landing";
import { resolveLandingPageSeo } from "@/lib/seo/resolve";
import { buildLandingPageJsonLd } from "@/lib/seo/structured-data";
import { StructuredData } from "./StructuredData";
import { TEMPLATE_COMPONENTS } from "./templates";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";

const DEFAULT_TEMPLATE: LandingTemplateId = "template-a";
const KNOWN_TEMPLATE_IDS = new Set<string>(Object.keys(TEMPLATE_COMPONENTS));

/**
 * Resolves `page.template` to a Template component, falling back to
 * Template A for any value that isn't one of the three known ids — the DB
 * CHECK constraint should prevent this, but the public route can't crash a
 * customer's page over a bad/unexpected column value.
 */
function resolveTemplateId(template: string): LandingTemplateId {
  return KNOWN_TEMPLATE_IDS.has(template) ? (template as LandingTemplateId) : DEFAULT_TEMPLATE;
}

/**
 * JSON-LD injection lives here — once, shared by every Template — rather
 * than duplicated in TemplateA/B/C, so all three always emit the exact same
 * structured-data engine (Stage 8 requirement).
 */
export function LandingPageRenderer({ page }: { page: LandingPage }) {
  const Template = TEMPLATE_COMPONENTS[resolveTemplateId(page.template)];
  const resolvedSeo = resolveLandingPageSeo(page);
  const jsonLd = buildLandingPageJsonLd(page, resolvedSeo);

  return (
    <>
      <StructuredData data={jsonLd} />
      <PageViewTracker slug={page.slug} />
      <Template page={page} />
    </>
  );
}
