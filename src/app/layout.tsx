import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "@next/third-parties/google";

import "@/styles/global.scss";
import "@/styles/components.scss";
import "@/styles/schema.scss";
import "@/styles/error.scss";
import "@/styles/common.scss";
import { baseMetaData } from "@/og";
import SubscriptionPopup from "@/components/popup/subscription";
import Script from "next/script";

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
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1550225145364569"
        crossOrigin="anonymous"
      ></script>
      <script
        async
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.6/kakao.min.js"
        integrity="sha384-WAtVcQYcmTO/N+C1N+1m6Gp8qxh+3NlnP7X1U7qP6P5dQY/MsRBNTh+e1ahJrkEm"
        crossOrigin="anonymous"
      ></script>
      <script
        type="text/javascript"
        src="//t1.daumcdn.net/kas/static/ba.min.js"
        async
      ></script>
      <head />
      <body>
        <div id="portal" />
        <SubscriptionPopup />
        {children}
      </body>
    </html>
  );
}
