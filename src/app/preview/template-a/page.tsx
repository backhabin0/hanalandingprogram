import type { Metadata } from "next";
import { TemplateA } from "@/components/landing/templates";
import { templateDemoContent } from "@/lib/mock-data";

const page = templateDemoContent["template-a"];

export const metadata: Metadata = {
  title: page.seo?.metaTitle ?? page.title,
  description: page.seo?.metaDescription ?? page.description,
};

export default function TemplateAPreviewPage() {
  return <TemplateA page={page} />;
}
