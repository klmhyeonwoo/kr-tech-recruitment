"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./pwa-install-banner.module.scss";

type InstallState = "idle" | "installable" | "ios" | "installed" | "dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "nklcb-pwa-banner-dismissed";

function getIOSInstructions() {
  return [
    { icon: "↑", text: "하단 공유 버튼을 탭하세요" },
    { icon: "＋", text: '"홈 화면에 추가"를 선택하세요' },
    { icon: "✓", text: '"추가"를 눌러 완료하세요' },
  ];
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

export default function PwaInstallBanner() {
  const [state, setState] = useState<InstallState>("idle");
  const [iosOpen, setIosOpen] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isInStandaloneMode()) {
      setState("installed");
      return;
    }

    if (sessionStorage.getItem(DISMISS_KEY)) {
      setState("dismissed");
      return;
    }

    if (isIOS()) {
      setState("ios");
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setState("installable");
    };

    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => setState("installed");
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt.current) return;
    await deferredPrompt.current.prompt();
    const result = await deferredPrompt.current.userChoice;
    if (result.outcome === "accepted") {
      setState("installed");
    }
    deferredPrompt.current = null;
  };

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setState("dismissed");
  };

  const handleIOSToggle = () => setIosOpen((prev) => !prev);

  if (state === "idle" || state === "installed" || state === "dismissed") {
    return null;
  }

  if (state === "installable") {
    return (
      <div className={styles.banner} role="region" aria-label="앱 설치 안내">
        <div className={styles.banner__row}>
          <div className={styles.banner__content}>
            <div className={styles.banner__icon} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14v-4H7l5-8v4h4l-5 8z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div className={styles.banner__text}>
              <strong>앱으로 더 빠르게</strong>
              <span>홈 화면에 추가하면 채용 공고를 더 편하게 확인할 수 있어요</span>
            </div>
          </div>
          <div className={styles.banner__actions}>
            <button
              type="button"
              className={styles.btn__install}
              onClick={handleInstall}
            >
              홈 화면에 추가
            </button>
            <button
              type="button"
              className={styles.btn__dismiss}
              onClick={handleDismiss}
              aria-label="닫기"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state === "ios") {
    return (
      <div className={styles.banner} role="region" aria-label="앱 설치 안내">
        <div className={styles.banner__row}>
          <div className={styles.banner__content}>
            <div className={styles.banner__icon} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14v-4H7l5-8v4h4l-5 8z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div className={styles.banner__text}>
              <strong>앱으로 더 빠르게</strong>
              <span>홈 화면에 추가하면 채용 공고를 더 편하게 확인할 수 있어요</span>
            </div>
          </div>
          <div className={styles.banner__actions}>
            <button
              type="button"
              className={styles.btn__install}
              onClick={handleIOSToggle}
              aria-expanded={iosOpen}
            >
              설치 방법 보기
            </button>
            <button
              type="button"
              className={styles.btn__dismiss}
              onClick={handleDismiss}
              aria-label="닫기"
            >
              ✕
            </button>
          </div>
        </div>

        {iosOpen && (
          <div className={styles.ios__guide} role="dialog" aria-label="iOS 설치 안내">
            <p className={styles.ios__guide__title}>Safari에서 홈 화면 추가하기</p>
            <ol className={styles.ios__steps}>
              {getIOSInstructions().map((step, i) => (
                <li key={i} className={styles.ios__step}>
                  <span className={styles.ios__step__icon} aria-hidden="true">
                    {step.icon}
                  </span>
                  <span>{step.text}</span>
                </li>
              ))}
            </ol>
            <p className={styles.ios__note}>
              * Safari 브라우저에서만 홈 화면 추가가 가능해요
            </p>
          </div>
        )}
      </div>
    );
  }

  return null;
}
