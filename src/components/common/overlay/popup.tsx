import React, { Children } from "react";
import styles from "@/styles/components/popup.module.scss";
import Button from "../button";

type PopupType = {
  title?: string | React.ReactNode;
  positiveCallback?: () => void;
  negativeCallback?: () => void;
  visibleButton?: boolean;
  children?: React.ReactNode;
  positiveButtonText?: string;
  negativeButtonText?: string;
  loader?: boolean;
  onClose?: () => void;
  isDisabledButton?: boolean;
  options?: {
    isPositiveButton?: boolean;
    isNegativeButton?: boolean;
    isTitle?: boolean;
  };
};

function Popup({
  title,
  positiveCallback,
  negativeCallback,
  children,
  positiveButtonText,
  negativeButtonText,
  visibleButton = true,
  loader = false,
  onClose,
  isDisabledButton = false,
  options = {
    isPositiveButton: true,
    isNegativeButton: true,
    isTitle: true,
  },
}: PopupType) {
  return (
    <div className={styles.popup__container} role="dialog" aria-label="서울데브클럽 구독">
      {onClose && (
        <button type="button" className={styles.popup__close} onClick={onClose} aria-label="닫기">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      )}
      {options.isTitle && <div className={styles.popup__title}> {title} </div>}
      <div className={styles.popup__content}>
        {Children.toArray(children).length > 0 ? (
          children
        ) : (
          <div className={styles.popup__visual} aria-hidden="true">
            <span className={`${styles.popup__logo} ${styles.popup__logo_a}`}><img src="/images/companies/naver.svg" alt="" /></span>
            <span className={`${styles.popup__logo} ${styles.popup__logo_b}`}><img src="/images/companies/toss.svg" alt="" /></span>
            <span className={`${styles.popup__logo} ${styles.popup__logo_c}`}><img src="/images/companies/kakao.svg" alt="" /></span>
            <span className={`${styles.popup__logo} ${styles.popup__logo_d}`}><img src="/images/companies/daangn.svg" alt="" /></span>
            <span className={styles.popup__mail}>
              <svg viewBox="0 0 48 48" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="11" width="36" height="26" rx="5" /><path d="m8 15 16 12 16-12" /></svg>
            </span>
          </div>
        )}
      </div>
      {visibleButton ? (
        <div className={styles.popup__button__container}>
          {options.isPositiveButton && (
            <Button
              onClick={positiveCallback}
              loader={loader}
              disabled={isDisabledButton}
            >
              {positiveButtonText ?? "5초만에 구독하기"}
            </Button>
          )}
          {options.isNegativeButton && (
            <Button onClick={negativeCallback}>
              {negativeButtonText ?? "오늘 하루 보지 않기"}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default Popup;
