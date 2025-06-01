import React, { Children } from "react";
import styles from "@/styles/components/popup.module.scss";
import Button from "./button";

type PopupType = {
  title?: string | React.ReactNode;
  positiveCallback?: () => void;
  negativeCallback?: () => void;
  visibleButton?: boolean;
  children?: React.ReactNode;
  positiveButtonText?: string;
  negativeButtonText?: string;
  loader?: boolean;
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
  isDisabledButton = false,
  options = {
    isPositiveButton: true,
    isNegativeButton: true,
    isTitle: true,
  },
}: PopupType) {
  return (
    <div className={styles.popup__container}>
      {options.isTitle && <div className={styles.popup__title}> {title} </div>}
      <div className={styles.popup__content}>
        {Children.toArray(children).length > 0 ? (
          children
        ) : (
          <div className={styles.popup__content__text}>
            <video preload="auto" autoPlay loop muted>
              <source src="/video/basket.mp4" type="video/mp4" />
            </video>
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
