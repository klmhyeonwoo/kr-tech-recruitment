"use client";
import styles from "@/styles/components/tab.module.scss";
import Tab from "./Tab";
import useTab from "@/hooks/useTab";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useAtom } from "jotai";
import { SEARCH_KEYWORD_STORE } from "../store";

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

  const { currentTab, setTab } = useTab({
    initialTab: setCurrentIndex(
      currentIndex ?? getCompanyCodeArray(data).indexOf(company)
    ),
    totalTabs: data.length,
  });

  const handleClickTab = async (index: number) => {
    if (index === currentTab) return;
    setTab(index);
    const params = new URLSearchParams(searchParams.toString());
    params.set("company", data[index].companyCode);
    // 카테고리 이동 시 기존 카테고리 및 키워드 파라미터를 제거
    if (params.has("category")) params.delete("category");
    if (keyword) setKeyword("");
    router.replace(`${pathname}/?${params.toString()}`);
  };

  const tabs = useMemo(
    () =>
      data.map((item, index) => {
        return {
          name: item.name,
          code: item.companyCode,
          id: index,
        };
      }),
    [data]
  );

  return (
    <div className={styles.tab__container}>
      {tabs.map(({ name, code, id }) => (
        <Tab
          key={code}
          label={name}
          value={code}
          index={id}
          active={currentTab}
          onClick={() => handleClickTab(id)}
        />
      ))}
    </div>
  );
}

export default TabSection;
