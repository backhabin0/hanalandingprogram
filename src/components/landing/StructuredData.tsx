import { safeJsonLdStringify } from "@/lib/seo/structured-data";

/** Renders one or more schema.org nodes as a single JSON-LD `<script>` tag. */
export function StructuredData({ data }: { data: Record<string, unknown>[] }) {
  if (data.length === 0) return null;

  // safeJsonLdStringify escapes </script>, <, and & before this reaches the DOM.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(data) }} />;
}
