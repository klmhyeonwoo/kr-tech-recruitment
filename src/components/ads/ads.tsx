"use client";

import Script from "next/script";
import {
  ADSENSE_CLIENT,
  ADSENSE_SCRIPT_ID,
  ADSENSE_SCRIPT_URL,
  markAdSenseScriptLoaded,
} from "@/utils/adsense";
import useAdSense from "./use-adsense";
import styles from "./ads.module.scss";

const AD_SLOT = "6016093098";
const IS_PREVIEW = process.env.NODE_ENV !== "production";

type AdsProps = {
  placement?: string;
  className?: string;
};

export default function Ads({ placement = "content", className }: AdsProps) {
  const { containerRef, adRef, isEligible } = useAdSense(!IS_PREVIEW);

  return (
    <aside
      ref={containerRef}
      className={[styles.container, className].filter(Boolean).join(" ")}
      aria-label="광고"
      data-ad-placement={placement}
    >
      <span className={styles.label}>광고</span>
      <div className={styles.slot}>
        {IS_PREVIEW ? (
          <div className={styles.placeholder} aria-hidden="true">
            광고 영역
          </div>
        ) : isEligible ? (
          <>
            <Script
              async
              id={ADSENSE_SCRIPT_ID}
              src={ADSENSE_SCRIPT_URL}
              crossOrigin="anonymous"
              strategy="afterInteractive"
              onLoad={markAdSenseScriptLoaded}
              onReady={markAdSenseScriptLoaded}
            />
            <ins
              ref={adRef}
              className="adsbygoogle"
              style={{ display: "block", width: "100%", maxWidth: 300, height: 250 }}
              data-ad-client={ADSENSE_CLIENT}
              data-ad-slot={AD_SLOT}
              data-full-width-responsive="false"
            />
          </>
        ) : null}
      </div>
    </aside>
  );
}
