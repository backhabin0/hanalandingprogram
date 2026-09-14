import { templateDemoContent } from "@/lib/mock-data";
import { TEMPLATE_COMPONENTS } from "@/components/landing/templates";
import type { LandingTemplateId } from "@/types/landing";

const PREVIEW_WIDTH = 1400;
const PREVIEW_SCALE = 0.28;

/**
 * Renders a real, fully-assembled template instance shrunk down with a CSS
 * transform and clipped to a fixed-height box — so the template gallery
 * shows an honest miniature of the actual page (header, hero, and the start
 * of the content), not a generic placeholder card.
 */
export function MiniTemplatePreview({ templateId }: { templateId: LandingTemplateId }) {
  const Template = TEMPLATE_COMPONENTS[templateId];
  const page = templateDemoContent[templateId];

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
      <div
        className="pointer-events-none absolute left-0 top-0 origin-top-left"
        style={{ width: `${PREVIEW_WIDTH}px`, transform: `scale(${PREVIEW_SCALE})` }}
      >
        <Template page={page} />
      </div>
      <div className="absolute inset-0 ring-1 ring-inset ring-black/5" aria-hidden />
    </div>
  );
}
