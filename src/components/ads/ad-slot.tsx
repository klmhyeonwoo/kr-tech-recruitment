"use client";

import Script from "next/script";
import {
  ADSENSE_CLIENT,
  ADSENSE_SCRIPT_ID,
  ADSENSE_SCRIPT_URL,
  markAdSenseScriptLoaded,
} from "@/utils/adsense";
import useAdSense from "./use-adsense";
import styles from "./ad-slot.module.scss";

const IS_PREVIEW = process.env.NODE_ENV !== "production";

/**
 * 애드센스 광고 단위 (계정: 광고 > 광고 단위 기준)
 * - banner    : "수평형 광고" 디스플레이, 가로 반응형
 * - infeed    : "홈 인피드 광고" 네이티브, 목록 사이에 카드처럼 보임
 * - multiplex : "하단 멀티플렉스 광고" 네이티브, 목록 끝에 추천 그리드로 보임
 */
const UNITS = {
  banner: { slot: "6016093098", format: "horizontal", responsive: "true" },
  infeed: { slot: "5534830372", format: "fluid", layoutKey: "-6t+ed+2i-1n-4w" },
  multiplex: { slot: "3873218162", format: "autorelaxed" },
} as const;

type Variant = keyof typeof UNITS;

type Props = {
  variant?: Variant;
  /** 위치를 구분하기 위한 이름 (data-placement 로만 남깁니다) */
  placement?: string;
  className?: string;
};

/**
 * 목록 사이·아래에 넣는 광고. 광고가 채워지지 않으면 자리를 접어서 빈 공간을 남기지 않습니다.
 */
export default function AdSlot({ variant = "banner", placement = "feed", className }: Props) {
  const { containerRef, adRef, isEligible } = useAdSense(!IS_PREVIEW);
  const unit = UNITS[variant];

  return (
    <aside
      ref={containerRef}
      className={[styles.slot, className].filter(Boolean).join(" ")}
      data-placement={placement}
      data-variant={variant}
      aria-label="광고"
    >
      <span className={styles.label}>광고</span>
      <div className={styles.frame}>
        {IS_PREVIEW ? (
          <div className={styles.placeholder} aria-hidden="true">광고 영역 · {variant}</div>
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
              style={{ display: "block", width: "100%" }}
              data-ad-client={ADSENSE_CLIENT}
              data-ad-slot={unit.slot}
              data-ad-format={unit.format}
              data-ad-layout-key={"layoutKey" in unit ? unit.layoutKey : undefined}
              data-full-width-responsive={"responsive" in unit ? unit.responsive : undefined}
            />
          </>
        ) : null}
      </div>
    </aside>
  );
}
