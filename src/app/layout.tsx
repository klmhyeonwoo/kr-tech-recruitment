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
import KakaoScript from "@/components/auth/kakao-script";

export const metadata: Metadata = baseMetaData;
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <Analytics />
      <GoogleAnalytics gaId="G-6M2JP9HLCY" />
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
        src="https://www.ezojs.com/ezoic/sa.min.js"
        strategy="afterInteractive"
      />
      <Script
        id="ezoic-standalone"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
              window.ezstandalone = window.ezstandalone || {};
              ezstandalone.cmd = ezstandalone.cmd || [];
            `,
        }}
      />
      <Script
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1550225145364569"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />

      {/* Daum/Kakao Ads */}
      <Script
        src="//t1.daumcdn.net/kas/static/ba.min.js"
        strategy="afterInteractive"
      />
      <head />
      <body>
        <div id="portal" />
        <SubscriptionPopup />
        {children}
      </body>
      <KakaoScript />
    </html>
  );
}
