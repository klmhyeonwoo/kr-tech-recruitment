"use client";
import styles from "@/styles/components/recruit-card.module.scss";
import icon_calendar from "@public/icon/calendar.svg";
import icon_calendar_light from "@public/icon/calendar_light.svg";
import icon_cube from "@public/icon/cube.svg";
import icon_cube_light from "@public/icon/cube_light.svg";

import Image from "next/image";
import { formatDate, scaledPositionName } from "@/utils/common";
import { useEffect, useRef, useState } from "react";
import {
  CAREER_TRACKER_UPDATED_EVENT,
  isRecruitmentNoticeScrappedInCareerTracker,
  removeRecruitmentNoticeFromCareerTracker,
  saveCompanyToCareerTracker,
} from "@/utils/careerTracker";

type cardType = {
  id: number;
  title: string;
  company: string;
  corporates: {
    corporateName: string;
    corporateCode: string;
  }[];
  position: string;
  fromDate: string;
  toDate: string;
  link: string;
};

function CardContainer({ children }: { children: React.ReactNode }) {
  return <div className={styles.card__wrapper}>{children}</div>;
}

function CardContent({
  id,
  title,
  company,
  corporates,
  position,
  fromDate,
  toDate,
  link,
}: cardType) {
  const createRecruitmentLink = ({
    id,
    path,
  }: {
    id: number;
    path: string;
  }) => {
    return `/recruitment-notices?${new URLSearchParams({
      id: String(id),
      path,
    }).toString()}`;
  };

  const handleCardClick = ({ id, path }: { id: number; path: string }) => {
    if (!id) return;
    window.open(createRecruitmentLink({ id, path }), "_blank");
  };
  const scaledDetailCorpotateName = corporates.map((corporate) => {
    return corporate.corporateName;
  });
  const isMoreCorporeates = useRef(corporates.length > 1);
  const scrapTargetCompanyName = scaledDetailCorpotateName[0] ?? company;
  const [isNoticeScrapped, setIsNoticeScrapped] = useState(false);

  useEffect(() => {
    const syncScrapState = () => {
      setIsNoticeScrapped(isRecruitmentNoticeScrappedInCareerTracker(id));
    };

    syncScrapState();
    window.addEventListener(CAREER_TRACKER_UPDATED_EVENT, syncScrapState);

    return () => {
      window.removeEventListener(CAREER_TRACKER_UPDATED_EVENT, syncScrapState);
    };
  }, [id]);

  const handleScrapClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (isNoticeScrapped) {
      removeRecruitmentNoticeFromCareerTracker(id);
      return;
    }

    saveCompanyToCareerTracker({
      companyName: scrapTargetCompanyName,
      recruitmentNoticeId: id,
      title,
      path: link,
    });
  };

  const handleShareClick = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    const sharePath = createRecruitmentLink({
      id,
      path: link,
    });
    const shareUrl = `${window.location.origin}${sharePath}`;
    const shareData = {
      title: `${scrapTargetCompanyName} 채용 공고`,
      text: title,
      url: shareUrl,
    };

    try {
      if (typeof navigator.share === "function") {
        await navigator.share(shareData);
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        window.alert("공유 링크가 복사되었어요.");
        return;
      }

      throw new Error("clipboard-not-available");
    } catch (error) {
      const hasCanceledShare =
        error instanceof DOMException && error.name === "AbortError";
      if (hasCanceledShare) return;

      try {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        window.alert("공유 링크가 복사되었어요.");
      } catch {
        window.alert("공유 링크 복사에 실패했어요. 다시 시도해주세요.");
      }
    }
  };

  return (
    <div className={styles.card__container}>
      <div className={styles.card__head}>
        <div
          className={styles.card__company__slot}
          data-is-more-corporates={isMoreCorporeates.current}
        >
          <span className={styles.card__company}>{company}</span>
          {isMoreCorporeates.current && (
            <span className={styles.card__coporate}>
              {`${scaledDetailCorpotateName.join(" · ")} 채용 중`}
            </span>
          )}
        </div>
      </div>
      <div className={styles.card__title__container}>
        <Image
          src={icon_cube}
          width={23}
          height={23}
          data-theme="light"
          alt=""
          aria-hidden="true"
        />
        <Image
          src={icon_cube_light}
          width={23}
          height={23}
          data-theme="dark"
          alt=""
          aria-hidden="true"
        />
        <span className={styles.card__title}> {title}</span>
      </div>
      <div className={styles.card__date__container}>
        <Image
          src={icon_calendar}
          width={23}
          height={23}
          data-theme="light"
          alt=""
          aria-hidden="true"
        />
        <Image
          src={icon_calendar_light}
          width={23}
          height={23}
          data-theme="dark"
          alt=""
          aria-hidden="true"
        />
        <span className={styles.card__timestamp}>
          {fromDate && toDate
            ? `${formatDate(fromDate)} ~ ${formatDate(toDate)}`
            : "해당 공고는 상시 채용이에요."}
        </span>
      </div>
      <span className={styles.card__position}>
        {position
          ? `${scaledPositionName(position)} 포지션으로 채용 중`
          : `해당 공고는 포지션이 명시되어 있지 않아요.`}
      </span>
      <div className={styles.card__actions}>
        <button
          type="button"
          className={styles.card__move__button}
          onClick={() => handleCardClick({ id: id, path: link })}
          aria-label={`${scrapTargetCompanyName} 모집 공고로 이동`}
          title="모집 공고 보기"
        >
          모집 공고 보기
        </button>
        <button
          type="button"
          className={styles.card__scrap__button}
          onClick={handleScrapClick}
          aria-label={
            isNoticeScrapped
              ? `${scrapTargetCompanyName} 스크랩 취소하기`
              : `${scrapTargetCompanyName} 공고를 내 스크랩에 담기`
          }
          title={isNoticeScrapped ? "스크랩 취소하기" : "내 스크랩에 담기"}
        >
          {isNoticeScrapped ? "스크랩 취소하기" : "스크랩하기"}
        </button>
        <button
          type="button"
          className={styles.card__share__button}
          onClick={handleShareClick}
          aria-label={`${scrapTargetCompanyName} 공고 링크 공유하기`}
          title="공고 링크 공유하기"
        >
          공유하기
        </button>
      </div>
    </div>
  );
}

const Card = Object.assign(CardContainer, {
  CardContent,
});

export default Card;
