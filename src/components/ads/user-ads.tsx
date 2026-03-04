import styles from "./user-ads.module.scss";
import desktopImage from "@public/images/ads/desktop.webp";
import mobileImage from "@public/images/ads/mobile.webp";
import { getImageProps } from "next/image";
import Anchor from "../common/navigation/anchor";

const TARGET_LINK =
  "https://www.layerapp.io/?utm_source=nklcb&utm_medium=display";
const AD_ALT_TEXT = "Layer 스폰서 광고 - 손쉬운 회고 작성부터 AI 분석까지";

const {
  props: { alt, ...desktopImageProps },
} = getImageProps({
  src: desktopImage,
  alt: AD_ALT_TEXT,
  sizes: "100vw",
});

const { props: mobileImageProps } = getImageProps({
  src: mobileImage,
  alt: AD_ALT_TEXT,
  sizes: "100vw",
});

export default function UserAds() {
  return (
    <aside className={styles.container} aria-label="스폰서 광고">
      <a
        className={styles.image__wrapper}
        href={TARGET_LINK}
        target="_blank"
        rel="sponsored noopener noreferrer"
        aria-label="Layer 스폰서 페이지 열기"
      >
        <picture className={styles.image__picture}>
          <source
            media="(max-width: 768px)"
            srcSet={mobileImageProps.srcSet}
          />
          <img
            {...desktopImageProps}
            alt={alt}
            className={styles.image}
            loading="lazy"
            decoding="async"
          />
        </picture>
      </a>
      <Anchor
        text="광고 문의하기"
        external={true}
        href="mailto:gentlemonster77@likelion.org"
      />
    </aside>
  );
}
