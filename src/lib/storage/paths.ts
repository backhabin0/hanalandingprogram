import { randomUUID } from "crypto";

export const LANDING_ASSETS_BUCKET = "landing-page-assets";

/**
 * Every object path is namespaced under `landing-pages/{landingPageId}/...`
 * and named with a fresh UUID, never the browser-supplied filename — an
 * original filename can contain spaces, Korean text, path separators, or
 * `../` segments, none of which are safe to use as a Storage object path
 * verbatim.
 */
function buildPath(landingPageId: string, segments: string[], extension: string): string {
  return `landing-pages/${landingPageId}/${segments.join("/")}/${randomUUID()}.${extension}`;
}

export const buildLogoPath = (landingPageId: string, extension: string) =>
  buildPath(landingPageId, ["logo"], extension);

export const buildHeroPath = (landingPageId: string, extension: string) =>
  buildPath(landingPageId, ["hero"], extension);

export const buildOgPath = (landingPageId: string, extension: string) =>
  buildPath(landingPageId, ["og"], extension);

export const buildProductImagePath = (landingPageId: string, productId: string, extension: string) =>
  buildPath(landingPageId, ["products", productId], extension);

export const buildCaseImagePath = (landingPageId: string, caseId: string, extension: string) =>
  buildPath(landingPageId, ["cases", caseId], extension);

export const buildGalleryImagePath = (landingPageId: string, extension: string) =>
  buildPath(landingPageId, ["gallery"], extension);
