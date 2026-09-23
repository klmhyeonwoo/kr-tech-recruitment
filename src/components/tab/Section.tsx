"use client";
import styles from "@/styles/components/tab.module.scss";
import Tab from "./Tab";
import useTab from "@/hooks/common/useTab";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useAtom } from "jotai";
import { SEARCH_KEYWORD_STORE } from "../../store";

type companiesType = {
  companyCode: string;
  name: string;
};

type TabData = {
  data: companiesType[];
  currentIndex?: number;
};

const setCurrentIndex = (index: number) => {
  return Math.max(index, 0);
};

const getCompanyCodeArray = (data: companiesType[]) => {
  return data.map((company) => company?.companyCode) ?? [];
};

function TabSection({ data, currentIndex }: TabData) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const company = searchParams.get("company") || "NAVER";
  const [keyword, setKeyword] = useAtom(SEARCH_KEYWORD_STORE);
  const tabListRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const { currentTab, setTab } = useTab({
    initialTab: setCurrentIndex(
      currentIndex ?? getCompanyCodeArray(data).indexOf(company),
    ),
    totalTabs: data.length,
  });

  const handleClickTab = async (index: number) => {
    if (index === currentTab) return;
    setTab(index);
    const params = new URLSearchParams(searchParams.toString());
    params.set("company", data[index].companyCode);
    // 카테고리 이동 시 기존 카테고리 및 키워드 파라미터를 제거
    // if (params.has("category")) params.delete("category");
    if (keyword) setKeyword("");
    router.replace(`${pathname}/?${params.toString()}`);
  };

  function handleKeyboard(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % data.length;
    else if (event.key === "ArrowLeft") next = (index + data.length - 1) % data.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = data.length - 1;
    else return;

    event.preventDefault();
    document.getElementById(`company-tab-${data[next].companyCode}`)?.focus({ preventScroll: true });
    void handleClickTab(next);
  }

  const tabs = useMemo(
    () =>
      data.map((item, index) => {
        return {
          name: item.name,
          code: item.companyCode,
          id: index,
        };
      }),
    [data],
  );

  useEffect(() => {
    const index = getCompanyCodeArray(data).indexOf(company);
    setTab(index);
    const tab = tabListRef.current?.children[index] as HTMLElement | undefined;
    tab?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [company, data, setTab]);

  useEffect(() => {
    const list = tabListRef.current;
    if (!list) return;
    const updateEdges = () => {
      const maxScroll = list.scrollWidth - list.clientWidth;
      setEdges({ start: list.scrollLeft > 4, end: list.scrollLeft < maxScroll - 4 });
    };
    updateEdges();
    list.addEventListener("scroll", updateEdges, { passive: true });
    const observer = new ResizeObserver(updateEdges);
    observer.observe(list);
    return () => {
      list.removeEventListener("scroll", updateEdges);
      observer.disconnect();
    };
  }, [data]);

  return (
    <div className={styles.company__tabs__viewport}
      data-fade-start={edges.start} data-fade-end={edges.end}>
      <div ref={tabListRef} className={`${styles.tab__container} ${styles.company__tabs}`}
        role="tablist" aria-label="기업 선택. 좌우로 밀어 더 많은 기업 보기">
        {tabs.map(({ name, code, id }) => (
          <Tab
            key={code}
            id={`company-tab-${code}`}
            label={name}
            value={code}
            index={id}
            active={currentTab}
            tabIndex={currentTab === id ? 0 : -1}
            onKeyDown={(event) => handleKeyboard(event, id)}
            onClick={() => handleClickTab(id)}
          />
        ))}
      </div>
    </div>
  );
}

export default TabSection;
