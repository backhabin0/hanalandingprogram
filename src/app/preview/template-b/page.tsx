import type { Metadata } from "next";
import { TemplateB } from "@/components/landing/templates";
import { templateDemoContent } from "@/lib/mock-data";

const page = templateDemoContent["template-b"];

export const metadata: Metadata = {
  title: page.seo?.metaTitle ?? page.title,
  description: page.seo?.metaDescription ?? page.description,
};

export default function TemplateBPreviewPage() {
  return <TemplateB page={page} />;
}
