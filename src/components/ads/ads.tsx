"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import {
  ADSENSE_CLIENT,
  ADSENSE_SCRIPT_ID,
  ADSENSE_SCRIPT_URL,
  markAdSenseScriptLoaded,
} from "@/utils/adsense";

export default function Ads() {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    setIsRendered(true);
  }, []);

  return (
    <aside aria-label="스폰서 광고 영역">
      {isRendered && (
        <>
          <Script
            async
            id={ADSENSE_SCRIPT_ID}
            src={ADSENSE_SCRIPT_URL}
            crossOrigin="anonymous"
            strategy="lazyOnload"
            onLoad={markAdSenseScriptLoaded}
            onReady={markAdSenseScriptLoaded}
          />
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={ADSENSE_CLIENT}
            data-ad-slot="6016093098"
            data-ad-format="auto"
            data-full-width-responsive="true"
          ></ins>
          <Script id="adsbygoogle-init">{`(adsbygoogle = window.adsbygoogle || []).push({});`}</Script>
        </>
      )}
    </aside>
  );
}
