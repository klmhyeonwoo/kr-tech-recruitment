import { useState, useCallback } from "react";

type UseTabTypes = {
  initialTab?: number;
  totalTabs: number;
};

type UseTabReturnTypes = {
  currentTab: number;
  setTab: (index: number) => void;
  nextTab: () => void;
  prevTab: () => void;
  isFirstTab: boolean;
  isLastTab: boolean;
};

export default function useTab({
  initialTab = 0,
  totalTabs,
}: UseTabTypes): UseTabReturnTypes {
  const [currentTab, setCurrentTab] = useState(initialTab);

  const setTab = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalTabs) return;
      setCurrentTab(index);
    },
    [totalTabs]
  );

  const nextTab = useCallback(() => {
    setCurrentTab((prev) => Math.min(prev + 1, totalTabs - 1));
  }, [totalTabs]);

  const prevTab = useCallback(() => {
    setCurrentTab((prev) => Math.max(prev - 1, 0));
  }, []);

  return {
    currentTab,
    setTab,
    nextTab,
    prevTab,
    isFirstTab: currentTab === 0,
    isLastTab: currentTab === totalTabs - 1,
  };
}
