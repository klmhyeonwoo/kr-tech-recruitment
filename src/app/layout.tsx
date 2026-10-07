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
import ChannelTalk from "@/components/common/floating/channel-talk";
import PwaRegister from "@/components/common/pwa-register";
import { SITE_NAME, SITE_URL } from "@/lib/seo/site";

export const metadata: Metadata = {
  ...baseMetaData,
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#222222",
};

const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      alternateName: "네카라쿠배 채용",
      url: SITE_URL,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      alternateName: ["nklcb", "네카라쿠배 채용"],
      url: SITE_URL,
      inLanguage: "ko-KR",
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
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
      <StructuredData data={siteStructuredData} />
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
              <ChannelTalk />
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
