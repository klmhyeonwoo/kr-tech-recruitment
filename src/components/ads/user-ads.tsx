"use client";
import React, { useEffect, useState } from "react";
import styles from "./user-ads.module.scss";
import desktopImage from "../../../public/images/ads/desktop.webp";
import mobileImage from "../../../public/images/ads/mobile.webp";
import Image from "next/image";
import { getDevice } from "kr-corekit";
import Anchor from "../common/anchor";

const TARGET_LINK = "https://layerapp.io";

export default function UserAds() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const { isDesktop } = getDevice();
    setIsDesktop(isDesktop);
  }, []);

  const naviagateExternalService = () => {
    window.open(TARGET_LINK);
  };

  return (
    <div className={styles.container}>
      <div className={styles.image__wrapper} onClick={naviagateExternalService}>
        <Image
          sizes="100vw"
          src={isDesktop ? desktopImage : mobileImage}
          alt="손쉬운 회고 작성부터 AI 분석까지, Layer"
          style={{
            objectFit: "cover",
          }}
          fill
        />
      </div>
      <Anchor
        text="광고 문의하기"
        external={true}
        href="mailto:gentlemonster77@likelion.org"
      />
    </div>
  );
}
