"use client";

import { useEffect, useRef, useState } from "react";
import {
  ADSENSE_LOADED_EVENT,
  requestAdSenseRender,
} from "@/utils/adsense";

const PRELOAD_MARGIN = "300px 0px";

export default function useAdSense(enabled: boolean) {
  const containerRef = useRef<HTMLElement | null>(null);
  const adRef = useRef<HTMLModElement | null>(null);
  const [isEligible, setIsEligible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!enabled || !container) return;

    let isNearViewport = false;
    let intersectionObserver: IntersectionObserver | undefined;
    let resizeObserver: ResizeObserver | undefined;

    const activate = () => {
      if (!isNearViewport || container.getBoundingClientRect().width <= 0) return;

      setIsEligible(true);
      intersectionObserver?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", activate);
    };

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(activate);
      resizeObserver.observe(container);
    } else {
      window.addEventListener("resize", activate);
    }

    if (typeof IntersectionObserver !== "undefined") {
      intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          isNearViewport = entry.isIntersecting;
          activate();
        },
        { rootMargin: PRELOAD_MARGIN },
      );
      intersectionObserver.observe(container);
    } else {
      isNearViewport = true;
      activate();
    }

    return () => {
      intersectionObserver?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", activate);
    };
  }, [enabled]);

  useEffect(() => {
    const adElement = adRef.current;
    if (!isEligible || !adElement) return;

    let resizeObserver: ResizeObserver | undefined;

    const initialize = () => {
      if (!requestAdSenseRender(adElement)) return;

      window.removeEventListener(ADSENSE_LOADED_EVENT, initialize);
      window.removeEventListener("resize", initialize);
      resizeObserver?.disconnect();
    };

    window.addEventListener(ADSENSE_LOADED_EVENT, initialize);
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(initialize);
      resizeObserver.observe(adElement);
    } else {
      window.addEventListener("resize", initialize);
    }
    initialize();

    return () => {
      window.removeEventListener(ADSENSE_LOADED_EVENT, initialize);
      window.removeEventListener("resize", initialize);
      resizeObserver?.disconnect();
    };
  }, [isEligible]);

  return { containerRef, adRef, isEligible };
}
