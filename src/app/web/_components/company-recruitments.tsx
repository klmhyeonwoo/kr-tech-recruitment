"use client";

import { useTransition } from "react";
import { useAtom } from "jotai";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SEARCH_KEYWORD_STORE } from "@/store";
import type { RecruitData } from "@/components/card/Section";
import SearchSection from "@/components/search/Section";
import CardSection from "@/components/card/Section";
import { scaledPositionName } from "@/utils/common";

type Props = {
  data: RecruitData[];
  companyName: string;
  companyCode: string;
  failed: boolean;
  categories: { code: string; name: string }[];
  categoriesFailed: boolean;
};

export default function CompanyRecruitments({ data, companyName, companyCode, failed, categories, categoriesFailed }: Props) {
  const [keyword, setKeyword] = useAtom(SEARCH_KEYWORD_STORE);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const category = params.get("category") ?? "";
  const query = (keyword ?? "").trim().toLowerCase();
  const filtered = data.filter((item) => [item.jobOfferTitle, item.companyName,
    ...(item.categories ?? []), ...(item.categories ?? []).map(scaledPositionName)]
    .some((value) => value?.toLowerCase().includes(query)));

  function changeCategory(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set("category", value);
    else next.delete("category");
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  }
  function reset() { setKeyword(""); changeCategory(""); }

  return <section id="company-results" role="tabpanel" aria-labelledby={`company-tab-${companyCode}`} className="company-results" aria-busy={pending}>
    <SearchSection data={categories} />
    {categoriesFailed && <p className="company-note" role="status">직무 목록을 불러오지 못했어요. 새로고침하여 다시 시도해 주세요.</p>}
    <div className="company-result-summary">
      <h2>{companyName} 채용 공고</h2>
      <div className="company-result-meta">
        <p role="status">{pending ? "불러오는 중…" : failed ? "불러오기 실패" : `${filtered.length}개 공고`}
          {category && ` · ${scaledPositionName(category)}`}{query && ` · ‘${keyword?.trim()}’ 검색`}</p>
        {(keyword || category) && <button type="button" className="company-reset" onClick={reset} disabled={pending}>필터 초기화</button>}
      </div>
    </div>
    {failed ? <div className="company-feedback" role="alert">
      <h3>공고를 불러오지 못했어요</h3><p>잠시 후 다시 시도해 주세요.</p>
      <button type="button" disabled={pending} onClick={() => startTransition(() => router.refresh())}>다시 불러오기</button>
    </div> : filtered.length === 0 ? <div className="company-feedback">
      <h3>{query || category ? "조건에 맞는 공고가 없어요" : "현재 등록된 공고가 없어요"}</h3>
      <p>{query || category ? "검색어와 직무 조건을 초기화하거나 다른 기업을 선택해 보세요." : "다른 기업의 공고도 살펴보세요."}</p>
      {(query || category) && <button type="button" onClick={reset}>필터 초기화</button>}
    </div> : <CardSection data={data} />}

  </section>;
}
