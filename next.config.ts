import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Next's default Server Action body limit is 1MB. Stage 9's image
      // uploads go straight into a Server Action as FormData (see
      // src/app/admin/pages/[id]/edit/image-actions.ts) — the largest
      // configured slot (hero/product/case/gallery) allows up to 10MB, so
      // the transport limit here must sit above that. This is only the
      // outer ceiling; each slot's own tighter limit is still enforced by
      // `validateImageFile` (src/lib/storage/validate.ts) with a proper
      // error message instead of a raw framework exception.
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
