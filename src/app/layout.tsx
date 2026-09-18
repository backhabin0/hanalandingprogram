import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getSiteUrl } from "@/lib/seo/site-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Google/Naver site ownership verification. Both are plain public meta tag
// values (not secrets) but stay server-only env vars regardless — nothing
// here needs NEXT_PUBLIC_ exposure to client JS, only to appear in the
// server-rendered <head>. Unset in an environment (e.g. local dev) means no
// verification meta at all, never an empty/placeholder tag.
const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();
const naverSiteVerification = process.env.NAVER_SITE_VERIFICATION?.trim();

const verification: Metadata["verification"] | undefined =
  googleSiteVerification || naverSiteVerification
    ? {
        ...(googleSiteVerification ? { google: googleSiteVerification } : {}),
        ...(naverSiteVerification ? { other: { "naver-site-verification": naverSiteVerification } } : {}),
      }
    : undefined;

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Hana LP Studio",
    template: "%s | Hana LP Studio",
  },
  description:
    "업종별 웹형 랜딩페이지를 자동으로 생성하고 관리하는 랜딩페이지 CMS.",
  verification,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
