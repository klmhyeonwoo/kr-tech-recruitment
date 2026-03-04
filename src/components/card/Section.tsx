"use client";

import Card from "@/components/card/RecruitCard";
import RecruitCardAd from "@/components/ads/recruit-card-ad";
import styles from "@/styles/components/recruit-card.module.scss";
import { useAtom } from "jotai";
import { SEARCH_KEYWORD_STORE } from "../../store";
import { scaledPositionName } from "@/utils/common";
import NotDataSwimming from "../common/feedback/not-data";

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
  const AD_INSERT_INTERVAL = 6;
  const MAX_INLINE_ADS = 4;
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

  let insertedAds = 0;
  const sectionFeedItems = filteredData.reduce<
    Array<
      | { type: "recruit"; key: string; item: RecruitData }
      | { type: "ad"; key: string }
    >
  >((acc, item, index) => {
    acc.push({
      type: "recruit",
      key: `recruit-${item.recruitmentNoticeId}-${index}`,
      item,
    });

    const isLastCard = index === filteredData.length - 1;
    const canInsertAd = insertedAds < MAX_INLINE_ADS;
    const shouldInsertAd =
      (index + 1) % AD_INSERT_INTERVAL === 0 && !isLastCard && canInsertAd;

    if (shouldInsertAd) {
      insertedAds += 1;
      acc.push({ type: "ad", key: `inline-ad-${insertedAds}` });
    }

    return acc;
  }, []);

  return (
    <section
      className={styles.card__section}
      data-exists={!!filteredData.length}
    >
      {filteredData.length ? (
        sectionFeedItems.map((entry) => {
          if (entry.type === "ad") {
            return <RecruitCardAd key={entry.key} />;
          }

          return (
            <Card key={entry.key}>
              <Card.CardContent
                id={entry.item.recruitmentNoticeId}
                title={entry.item.jobOfferTitle}
                company={generateCompanyName(entry.item)}
                corporates={entry.item.corporates}
                position={entry.item.standardCategory}
                fromDate={entry.item.startAt}
                toDate={entry.item.endAt}
                link={entry.item.url}
              />
            </Card>
          );
        })
      ) : (
        <NotDataSwimming />
      )}
    </section>
  );
}
