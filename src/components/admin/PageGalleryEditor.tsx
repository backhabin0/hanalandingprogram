"use client";

import { FormSection } from "@/components/admin/FormField";
import { GalleryEditor } from "@/components/admin/GalleryEditor";
import type { LandingGalleryImage } from "@/types/landing";
import {
  addPageGalleryImageAction,
  deletePageGalleryImageAction,
  savePageGalleryImagesAction,
} from "@/app/admin/pages/[id]/edit/image-actions";

export function PageGalleryEditor({
  landingPageId,
  initialImages,
  fallbackAlt,
}: {
  landingPageId: string;
  initialImages: LandingGalleryImage[];
  /** Used as the alt-text fallback (e.g. business name) when an image has none set. */
  fallbackAlt: string;
}) {
  return (
    <FormSection
      title="페이지 갤러리"
      description="시공 사진, 매장/시설 사진, Before/After 등 페이지 전체에서 사용할 사진을 등록합니다."
    >
      <GalleryEditor
        images={initialImages}
        fallbackAlt={fallbackAlt}
        addAction={(formData) => addPageGalleryImageAction(landingPageId, formData)}
        saveAction={(images) => savePageGalleryImagesAction(landingPageId, images)}
        deleteAction={(imageId) => deletePageGalleryImageAction(landingPageId, imageId)}
      />
    </FormSection>
  );
}
