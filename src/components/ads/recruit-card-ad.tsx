"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";
import styles from "@/styles/components/recruit-card.module.scss";

const AD_CLIENT = "ca-pub-1550225145364569";
const INLINE_AD_SLOT = "6016093098";
const ADSENSE_SCRIPT_ID = "adsbygoogle-lib";

type AdSenseWindow = Window & {
  adsbygoogle?: unknown[];
};

export default function RecruitCardAd() {
  const adRef = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    const adElement = adRef.current;
    if (!adElement) return;
    if (adElement.getAttribute("data-adsbygoogle-status")) return;

    try {
      const adWindow = window as AdSenseWindow;
      adWindow.adsbygoogle = adWindow.adsbygoogle || [];
      adWindow.adsbygoogle.push({});
    } catch (error) {
      console.error("Failed to render inline ad card:", error);
    }
  }, []);

  return (
    <aside
      className={styles.card__wrapper}
      data-ad-card="true"
      aria-label="스폰서 광고"
    >
      <div className={styles.card__container}>
        <span className={styles.card__ad__badge}>SPONSORED</span>
        <div className={styles.card__ad__slot}>
          <Script
            async
            id={ADSENSE_SCRIPT_ID}
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={AD_CLIENT}
            data-ad-slot={INLINE_AD_SLOT}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </aside>
  );
}
