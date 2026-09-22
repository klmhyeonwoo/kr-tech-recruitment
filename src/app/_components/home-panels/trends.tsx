"use client";

import { useQuery } from "@tanstack/react-query";
import type { TrendsData } from "@/app/tech-trends/page";
import TrendChart from "@/app/tech-trends/_components/TrendChart";
import CriteriaAccordion from "@/app/tech-trends/_components/CriteriaAccordion";
import styles from "./panels.module.scss";

export default function TrendsPanel() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["home-tech-trends"],
    queryFn: async ({ signal }): Promise<TrendsData> => {
      const response = await fetch("https://raw.githubusercontent.com/klmhyeonwoo/collector/refs/heads/main/data/trends.json", { signal });
      if (!response.ok) throw new Error("Trends unavailable");
      const result: TrendsData = await response.json();
      if (!result.domains || !Object.keys(result.domains).length ||
        !Object.values(result.domains).every((domain) => Array.isArray(domain.rankings))) {
        throw new Error("Invalid trends data");
      }
      return result;
    },
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });
  return <section className={styles.panel}>
    <h1>개발 트렌드</h1>
    {isPending && <p className={styles.empty} role="status">트렌드를 불러오고 있어요.</p>}
    {isError && <div className={styles.empty} role="alert">
      <p>트렌드를 불러오지 못했어요.</p>
      <button type="button" onClick={() => void refetch()}>다시 불러오기</button>
    </div>}
    {data && <><TrendChart data={data} /><CriteriaAccordion /></>}
  </section>;
}
