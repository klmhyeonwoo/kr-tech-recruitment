"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";
import styles from "@/styles/components/recruit-card.module.scss";
import {
  ADSENSE_CLIENT,
  ADSENSE_LOADED_EVENT,
  ADSENSE_SCRIPT_ID,
  ADSENSE_SCRIPT_URL,
  isAdSenseScriptLoaded,
  markAdSenseScriptLoaded,
  requestAdSenseRender,
} from "@/utils/adsense";

const INLINE_AD_SLOT = "6016093098";

export default function RecruitCardAd() {
  const adRef = useRef<HTMLModElement | null>(null);

  const renderInlineAd = useCallback(() => {
    const adElement = adRef.current;
    if (!adElement) return false;
    if (adElement.getAttribute("data-adsbygoogle-status")) return true;
    if (!isAdSenseScriptLoaded()) return false;

    try {
      requestAdSenseRender();
      return true;
    } catch (error) {
      console.error("Failed to render inline ad card:", error);
      return false;
    }
  }, []);

  useEffect(() => {
    if (renderInlineAd()) return;

    const handleScriptLoaded = () => {
      renderInlineAd();
    };

    window.addEventListener(ADSENSE_LOADED_EVENT, handleScriptLoaded);

    return () => {
      window.removeEventListener(ADSENSE_LOADED_EVENT, handleScriptLoaded);
    };
  }, [renderInlineAd]);

  return (
    <aside
      className={styles.card__wrapper}
      data-ad-card="true"
      aria-label="스폰서 광고"
    >
      <div className={styles.card__container}>
        <span className={styles.card__ad__badge}>ADS</span>
        <div className={styles.card__ad__slot}>
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
            ref={adRef}
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={ADSENSE_CLIENT}
            data-ad-slot={INLINE_AD_SLOT}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </aside>
  );
}
