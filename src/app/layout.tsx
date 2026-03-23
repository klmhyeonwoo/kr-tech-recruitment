import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";

import "@/styles/global.scss";
import "@/styles/components.scss";
import "@/styles/schema.scss";
import "@/styles/error.scss";
import "@/styles/common.scss";
import "@/styles/utility.scss";
import { baseMetaData } from "@/og";
import SubscriptionPopup from "@/components/popup/subscription";
import KakaoScript from "@/lib/auth/kakao-script";
import StructuredData from "@/lib/seo/structured-data";
import QueryProvider from "@/lib/tanstack/react-query/query-provider";
import ClarityProvider from "@/lib/clarity/clarity-provider";
import LenisProvider from "@/lib/lenis/lenis-provider";
import ScrollFloationButton from "@/components/common/floating/scroll-floating-button";
import CareerTrackerFloating from "@/components/common/floating/career-tracker-floating";
import PwaRegister from "@/components/common/pwa-register";

export const metadata: Metadata = {
  ...baseMetaData,
  manifest: "/manifest.json",
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#222222",
};

const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "네카라쿠배 채용",
  alternateName: [
    "nklcb",
    "네카라쿠배",
    "빅테크 채용",
    "네이버 채용",
    "카카오 채용",
    "라인 채용",
    "쿠팡 채용",
    "배달의민족 채용",
    "토스 채용",
    "당근 채용",
  ],
  url: "https://nklcb.kr",
  description:
    "네이버 채용, 카카오 채용, 라인 채용, 쿠팡 채용, 배달의 민족 채용, 당근 채용, 토스 채용 정보를 한눈에! 네이버, 카카오, 라인, 쿠팡, 배달의민족, 토스, 당근, 두나무 등 대한민국 대표 IT 기업의 최신 채용 공고를 실시간으로 확인하고 지원하세요.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://nklcb.kr/web?search={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
  publisher: {
    "@type": "Organization",
    name: "네카라쿠배 채용",
    url: "https://nklcb.kr",
  },
  about: [
    {
      "@type": "Thing",
      name: "네이버 채용",
    },
    {
      "@type": "Thing",
      name: "카카오 채용",
    },
    {
      "@type": "Thing",
      name: "라인 채용",
    },
    {
      "@type": "Thing",
      name: "쿠팡 채용",
    },
    {
      "@type": "Thing",
      name: "배달의민족 채용",
    },
    {
      "@type": "Thing",
      name: "토스 채용",
    },
    {
      "@type": "Thing",
      name: "당근 채용",
    },
    {
      "@type": "Thing",
      name: "두나무 채용",
    },
    {
      "@type": "Thing",
      name: "야놀자 채용",
    },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta
          name="naver-site-verification"
          content="628fcc13f939f4cf5b58a91fc0c19cc04c9c4acb"
        />
      </head>
      <Analytics />
      <GoogleAnalytics gaId="G-6M2JP9HLCY" />
      <StructuredData data={organizationStructuredData} />
      <Script
        src="https://cmp.gatekeeperconsent.com/min.js"
        data-cfasync="false"
        strategy="afterInteractive"
      />
      <Script
        src="https://the.gatekeeperconsent.com/cmp.min.js"
        data-cfasync="false"
        strategy="afterInteractive"
      />

      {/* Daum/Kakao Ads */}
      <Script
        src="//t1.daumcdn.net/kas/static/ba.min.js"
        strategy="afterInteractive"
      />
      <body>
        <ClarityProvider>
          <QueryProvider>
            <LenisProvider>
              <PwaRegister />
              <div id="portal" />
              <SubscriptionPopup />
              <CareerTrackerFloating />
              <ScrollFloationButton />
              {children}
            </LenisProvider>
          </QueryProvider>
        </ClarityProvider>
      </body>
      <KakaoScript />
    </html>
  );
}
