"use client";

import { Fragment } from "react";
import Ads from "@/components/ads/ads";
import Card from "@/components/card/RecruitCard";
import RecruitCardAd from "@/components/ads/recruit-card-ad";
import styles from "@/styles/components/recruit-card.module.scss";
import feedStyles from "./recruit-feed.module.scss";
import { useAtom } from "jotai";
import { SEARCH_KEYWORD_STORE } from "../../store";
import { scaledPositionName } from "@/utils/common";
import NotDataSwimming from "../common/feedback/not-data";

const LEADING_RECRUIT_COUNT = 2;
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
  const filteredData =
    data?.filter((item) => {
      if (keyword === null) return true;
      return (
        item.jobOfferTitle?.toLowerCase().includes(keyword) ||
        item.jobOfferTitle.includes(keyword) ||
        item.categories?.some((category) => {
          const originalCategory = category?.toLowerCase().trim();
          const scaledCategory = scaledPositionName(
            category?.trim(),
          )?.toLowerCase();
          return (
            originalCategory?.includes(keyword) ||
            scaledCategory?.includes(keyword)
          );
        })
      );
    }) ?? [];
  const generateCompanyName = (item: RecruitData) => {
    if (item.corporates.length > 0) {
      if (item.corporates.length === 1) {
        return item.corporates[0].corporateName;
      } else {
        return `${item.corporates[0].corporateName} 외 ${
          item.corporates.length - 1
        }개 계열사`;
      }
    }
    return item.companyName;
  };

  const renderRecruitCard = (item: RecruitData) => (
    <Card key={item.recruitmentNoticeId}>
      <Card.CardContent
        id={item.recruitmentNoticeId}
        title={item.jobOfferTitle}
        company={generateCompanyName(item)}
        corporates={item.corporates}
        position={item.standardCategory}
        fromDate={item.startAt}
        toDate={item.endAt}
        link={item.url}
      />
    </Card>
  );

  if (filteredData.length < 4) {
    return (
      <section
        className={styles.card__section}
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
        className={`${styles.card__section} ${feedStyles.leading}`}
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
        className={`${styles.card__section} ${feedStyles.remaining}`}
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
                  <RecruitCardAd />
                </div>
              )}
            </Fragment>
          );
        })}
      </section>
    </div>
  );
}
