"use client";
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Clarity from "@microsoft/clarity";

type ClarityContextValue = {
  isReady: boolean;
  event: (eventName: string) => void;
  setTag: (key: string, value: string | string[]) => void;
  identify: (
    customId: string,
    customSessionId?: string,
    customPageId?: string,
    friendlyName?: string,
  ) => void;
  consent: (consent?: boolean) => void;
};

const ClarityContext = createContext<ClarityContextValue | null>(null);
let isClarityInitialized = false;

export function useClarity() {
  const context = useContext(ClarityContext);
  if (!context) {
    throw new Error("useClarity must be used within ClarityProvider");
  }
  return context;
}

export default function ClarityProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(isClarityInitialized);

  useEffect(() => {
    if (isClarityInitialized) {
      setIsReady(true);
      return;
    }

    const clarityKey = process.env.NEXT_PUBLIC_CLARITY_KEY;
    if (!clarityKey) return;

    Clarity.init(clarityKey);
    isClarityInitialized = true;
    setIsReady(true);
  }, []);

  const value = useMemo<ClarityContextValue>(
    () => ({
      isReady,
      event: (eventName) => {
        if (!isClarityInitialized) return;
        Clarity.event(eventName);
      },
      setTag: (key, tagValue) => {
        if (!isClarityInitialized) return;
        Clarity.setTag(key, tagValue);
      },
      identify: (customId, customSessionId, customPageId, friendlyName) => {
        if (!isClarityInitialized) return;
        Clarity.identify(customId, customSessionId, customPageId, friendlyName);
      },
      consent: (consent) => {
        if (!isClarityInitialized) return;
        Clarity.consent(consent);
      },
    }),
    [isReady],
  );

  return (
    <ClarityContext.Provider value={value}>{children}</ClarityContext.Provider>
  );
}
