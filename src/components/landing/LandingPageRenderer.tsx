import type { LandingPage, LandingTemplateId } from "@/types/landing";
import { TEMPLATE_COMPONENTS } from "./templates";

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

export function LandingPageRenderer({ page }: { page: LandingPage }) {
  const Template = TEMPLATE_COMPONENTS[resolveTemplateId(page.template)];
  return <Template page={page} />;
}
