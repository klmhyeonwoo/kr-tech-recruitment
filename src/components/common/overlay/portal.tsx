"use client";
import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

const PORTAL_ROOT_IDS = ["portal"];

type Props = {
  children: ReactNode;
  antiScroll?: boolean;
  id: string;
};

export const Portal = ({ id, antiScroll = false, children }: Props) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!PORTAL_ROOT_IDS.includes(id) || !mounted) return;
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
