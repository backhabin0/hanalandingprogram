import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // BunnyCode(/bunnycode/*)는 별도의 Vercel 프로젝트
  // (https://bunnycodehomepage.vercel.app)에서 호스팅되는 정적/서버리스
  // 사이트다. hanapage.co.kr 도메인은 계속 이 프로젝트가 소유하되,
  // /bunnycode/* 요청만 BunnyCode 프로젝트로 external rewrite한다
  // (redirect가 아니므로 사용자 주소창에는 hanapage.co.kr/bunnycode/...가
  // 그대로 유지된다). beforeFiles로 등록해 `src/app/[slug]/page.tsx`
  // (단일 세그먼트 동적 라우트, 예: /bunnycode)와 절대 충돌하지 않도록
  // 다른 어떤 라우팅 검사보다 먼저 매칭시킨다.
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/bunnycode",
          destination: "https://bunnycodehomepage.vercel.app/bunnycode",
        },
        {
          source: "/bunnycode/:path*",
          destination: "https://bunnycodehomepage.vercel.app/bunnycode/:path*",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
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
