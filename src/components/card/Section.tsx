"use client";

import { Fragment } from "react";
import Ads from "@/components/ads/ads";
import JobCard from "@/components/jobs/job-card";
import useBookmarks from "@/utils/use-bookmarks";
import AdSlot from "@/components/ads/ad-slot";
import feedStyles from "./recruit-feed.module.scss";
import { useAtom } from "jotai";
import { SEARCH_KEYWORD_STORE } from "../../store";
import { scaledPositionName } from "@/utils/common";
import NotDataSwimming from "../common/feedback/not-data";

const LEADING_RECRUIT_COUNT = 3;
const SECONDARY_AD_AFTER = 14;

export type RecruitData = {
  recruitmentNoticeId: number;
  categories: string[];
  clickCount: number;
  companyCode: string;
  companyName: string;
  corporates: {
    corporateName: string;
    corporateCode: string;
  }[];
  standardCategory: string;
  endAt: string;
  startAt: string;
  jobOfferTitle: string;
  url: string;
};

export default function CardSection({ data }: { data: RecruitData[] }) {
  const [keyword] = useAtom(SEARCH_KEYWORD_STORE);
  const bookmarks = useBookmarks();
  const filteredData =
    data?.filter((item) => {
      const query = (keyword ?? "").trim().toLowerCase();
      if (!query) return true;
      return (
        item.jobOfferTitle?.toLowerCase().includes(query) ||
        item.companyName?.toLowerCase().includes(query) ||
        item.categories?.some((category) => {
          const originalCategory = category?.toLowerCase().trim();
          const scaledCategory = scaledPositionName(
            category?.trim(),
          )?.toLowerCase();
          return (
            originalCategory?.includes(query) ||
            scaledCategory?.includes(query)
          );
        })
      );
    }) ?? [];
  const renderRecruitCard = (item: RecruitData) => (
    <JobCard
      key={item.recruitmentNoticeId}
      item={item}
      bookmarked={bookmarks.ids.includes(item.recruitmentNoticeId)}
      onToggleBookmark={bookmarks.toggle}
    />
  );

  if (filteredData.length < 4) {
    return (
      <section
        className={feedStyles.cards}
        data-exists={!!filteredData.length}
        aria-label="채용 공고"
      >
        {filteredData.length ? (
          filteredData.map(renderRecruitCard)
        ) : (
          <NotDataSwimming />
        )}
      </section>
    );
  }

  const leadingCards = filteredData.slice(0, LEADING_RECRUIT_COUNT);
  const remainingCards = filteredData.slice(LEADING_RECRUIT_COUNT);

  return (
    <div className={feedStyles.feed}>
      <section
        className={`${feedStyles.cards} ${feedStyles.leading}`}
        data-exists="true"
        aria-label="첫 채용 공고"
      >
        {leadingCards.map(renderRecruitCard)}
      </section>
      <div className={feedStyles.rail}>
        <div className={feedStyles.railContent}>
          <Ads placement="recruit-primary" />
        </div>
      </div>
      <section
        className={`${feedStyles.cards} ${feedStyles.remaining}`}
        data-exists="true"
        aria-label="더 많은 채용 공고"
      >
        {remainingCards.map((item, index) => {
          const recruitIndex = index + LEADING_RECRUIT_COUNT;
          const showSecondaryAd =
            recruitIndex + 1 === SECONDARY_AD_AFTER &&
            filteredData.length > SECONDARY_AD_AFTER;

          return (
            <Fragment key={item.recruitmentNoticeId}>
              {renderRecruitCard(item)}
              {showSecondaryAd && (
                <div className={feedStyles.inlineAd}>
                  <AdSlot variant="infeed" placement="web-feed" />
                </div>
              )}
            </Fragment>
          );
        })}
      </section>
    </div>
  );
}
