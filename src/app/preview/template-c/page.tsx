import type { Metadata } from "next";
import { TemplateC } from "@/components/landing/templates";
import { templateDemoContent } from "@/lib/mock-data";

const page = templateDemoContent["template-c"];

export const metadata: Metadata = {
  title: page.seo?.metaTitle ?? page.title,
  description: page.seo?.metaDescription ?? page.description,
};

export default function TemplateCPreviewPage() {
  return <TemplateC page={page} />;
}
