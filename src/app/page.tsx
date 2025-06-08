import Banner from "@/components/common/banner";
import { Fragment } from "react";
import AnnounceCard from "@/components/card/AnnounceCard";
import "@/styles/domain/main.scss";
import { api } from "@/api";
import greeting_image_eyes from "../../public/images/eyes.gif";
import greeting_image_waving from "../../public/images/waving.gif";
import greeting_image_rocket from "../../public/images/rocket.gif";
import greeting_image_virus from "../../public/images/virus.gif";
import HomeLogo from "@/components/common/home-logo";
import GreetingCard from "@/components/common/greeting-card";

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
            title="네카라쿠배 공고 모아보기"
            subTitle="네카라쿠배 빅테크 채용관"
            description="네이버, 카카오, 라인, 쿠팡, 배달의 민족 등 국내 빅테크 기업들의 채용 공고를 한 눈에 확인해보세요"
            navigate="web"
            colorSet={["#16222A", "#3A6073"]}
            image={greeting_image_eyes}
          />
          <GreetingCard
            title="이용에 불편함이 있으신가요?"
            subTitle="서비스 문의하기"
            description="서비스 이용 중 불편함이나 필요한 기능이 있다면 언제든지 문의해 주세요."
            navigate="web"
            colorSet={["#1A2980", "#26D0CE"]}
            image={greeting_image_waving}
          />
          <GreetingCard
            title="취업 및 이직 커뮤니티"
            subTitle="커뮤니티 참여하기"
            description="커뮤니티를 통해 여러분들의 생각과 다른 사람들과 이야기하며 다양한 의견을 나누어보세요."
            navigate="not-yet"
            colorSet={["#2C3E50", "#4CA1AF"]}
            image={greeting_image_virus}
          />
          <GreetingCard
            title="더 많은 기능들이 다가오고 있어요"
            subTitle="로켓처럼 빠르게 발전하고 있어요"
            navigate="release-notes"
            description="더 다양한 정보를 위해 지속적으로 발전하고 있으며, 더 많은 기능들이 곧 추가될 예정이에요."
            colorSet={["#232526", "#414345"]}
            image={greeting_image_rocket}
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
