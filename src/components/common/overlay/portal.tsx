"use client";
import { PORTAL_STORE } from "@/store";
import { useSetAtom } from "jotai";
import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Cookies from "js-cookie";

type Props = {
  children: ReactNode;
  antiScroll?: boolean;
  id: string;
};

export const Portal = ({ id, antiScroll = false, children }: Props) => {
  const [mounted, setMounted] = useState(false);
  const setIsShowPopup = useSetAtom(PORTAL_STORE);
  const rootIdList = ["portal"];

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (mounted) {
      const isCookieExists = Cookies.get("subscriptionPopup") === "closed";
      if (isCookieExists) {
        setIsShowPopup(false);
        return;
      }
      setTimeout(() => {
        setIsShowPopup(true);
      }, 800);
    }

    if (rootIdList.includes(id) && mounted) {
      if (children && antiScroll) {
        document.body.style.overflow = "hidden";
      }

      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [mounted]);

  if (!mounted) return null;
  const el = document.getElementById(`${id}`) as HTMLElement;

  return createPortal(children, el);
};
