import Banner from "@/components/common/banner";
import { Fragment } from "react";
import AnnounceCard from "@/components/card/AnnounceCard";
import "@/styles/domain/main.scss";
import { api } from "@/api";
import GreetingCard from "@/components/common/greeting-card";
import greeting_image_eyes from "../../public/images/eyes.gif";
import greeting_image_waving from "../../public/images/waving.gif";
import HomeLogo from "@/components/common/home-logo";

export const dynamic = "force-dynamic";

async function getRecruitData({
  params,
}: {
  params: {
    page: number;
    pageSize: number;
  };
}) {
  try {
    const { data } = await api.get(`/recruitment-notices/redirections`, {
      params,
    });
    const list = data.list || [];
    const scaledData = {
      ...data,
      list: list.map((item: { url: string }) => ({
        ...item,
        url: btoa(item.url),
      })),
    };
    return scaledData;
  } catch (error) {
    return { data: [], error };
  }
}

async function getPopularRecruitData({
  params,
}: {
  params: {
    date: string;
  };
}) {
  try {
    const { data } = await api.get(
      `/recruitment-notices/redirections/daily-rank`,
      {
        params,
      }
    );
    const list = data.list || [];
    const scaledData = {
      ...data,
      list: list.map((item: { url: string }) => ({
        ...item,
        url: btoa(item.url),
      })),
    };
    return scaledData;
  } catch (error) {
    return { data: [], error };
  }
}

export default async function Home() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const { list: recentRecruitList } = await getRecruitData({
    params: {
      page: 0,
      pageSize: 10,
    },
  });
  const { list: popularRecruitList } = await getPopularRecruitData({
    params: {
      date: yesterday.toISOString().split("T")[0],
    },
  });

  return (
    <section className="container">
      <article className="banner__wrapper">{/* 배너 영역 */}</article>
      <article className="wrapper">
        <HomeLogo />
        <div className="greeting__card__wrapper">
          <GreetingCard
            title="빅테크 채용 공고 확인하기"
            description="네카라쿠배 채용 공고를 한 눈에 확인해보세요"
            image={greeting_image_eyes}
            navigate="web"
          />
          <GreetingCard
            title="서비스 문의하기"
            description="다양한 서비스들을 준비하고 있어요"
            image={greeting_image_waving}
            navigate="channel-talk"
          />
        </div>
        <Banner
          title="이제 네카라쿠배 빅테크 공고를 한 서비스에서 경험해보세요"
          description={
            <Fragment>
              <span>
                네이버 · 카카오 · 라인 · 쿠팡 · 배달의민족 (nklcb) 등 다양한
                국내 빅테크 기업들의 채용정보를 한 눈에 확인해보세요
              </span>
              <span>
                매 공고 별 수집은 매일 업데이트 되며 빠르게 최신 공고를 모아볼
                수 있어요.
              </span>
            </Fragment>
          }
        />
        <div className="announce__card__wrapper">
          {/* TODO: 새로 등록된 공고, 어제 올라온 공고 카드 섹션으로 제공하기 */}
          <AnnounceCard
            title="새롭게 등록된 공고"
            description="새롭게 등록된 오늘의 공고를 확인해보세요"
            items={recentRecruitList}
          />
          <AnnounceCard
            title="어제 인기있었던 공고"
            description="어제 조회수가 높았던 공고를 확인해보세요"
            items={popularRecruitList.slice(0, 10)}
          />
        </div>
      </article>
      <article className="banner__wrapper">{/* 배너 영역 */}</article>
    </section>
  );
}
