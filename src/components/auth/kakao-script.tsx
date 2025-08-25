"use client";

import { checkInitializedKakaoSDK } from "@/utils/socialUtil";
import Script from "next/script";

export default function KakaoScript() {
  return (
    <Script
      async
      src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.6/kakao.min.js"
      integrity="sha384-WAtVcQYcmTO/N+C1N+1m6Gp8qxh+3NlnP7X1U7qP6P5dQY/MsRBNTh+e1ahJrkEm"
      crossOrigin="anonymous"
      onLoad={checkInitializedKakaoSDK}
    ></Script>
  );
}
