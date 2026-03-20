"use client";
import { PORTAL_STORE } from "@/store";
import { useSetAtom } from "jotai";
import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Cookies from "js-cookie";

const SUBSCRIPTION_POPUP_COOKIE_KEY = "subscriptionPopup";
const SUBSCRIPTION_POPUP_SHOW_DELAY_MS = 800;

function useSubscriptionPopupVisibility() {
  const setIsShowPopup = useSetAtom(PORTAL_STORE);

  useEffect(() => {
    const isDismissed = Cookies.get(SUBSCRIPTION_POPUP_COOKIE_KEY) === "closed";
    if (isDismissed) {
      setIsShowPopup(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsShowPopup(true);
    }, SUBSCRIPTION_POPUP_SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, [setIsShowPopup]);
}

type Props = {
  children: ReactNode;
  antiScroll?: boolean;
  id: string;
};

export const Portal = ({ id, antiScroll = false, children }: Props) => {
  const [mounted, setMounted] = useState(false);
  const rootIdList = ["portal"];

  useSubscriptionPopupVisibility();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!rootIdList.includes(id) || !mounted) return;
    if (!children || !antiScroll) return;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [id, mounted, children, antiScroll]);

  if (!mounted) return null;
  const el = document.getElementById(`${id}`) as HTMLElement;

  return createPortal(children, el);
};
