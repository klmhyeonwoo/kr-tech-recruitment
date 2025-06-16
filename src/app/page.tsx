import AnnounceCard from "@/components/card/AnnounceCard";
import "@/styles/domain/main.scss";
import { api } from "@/api";
import HomeLogo from "@/components/common/home-logo";
import GreetingSwiper from "@/components/swiper/GreetingSwiper";
import QuestionBanner from "@/components/question/question-banner";

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

async function getHotIssueQuestionData() {
  try {
    const { data } = await api.get(`/hot-issues/activated-list`);
    return data;
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

  const { list: hotIssueList } = await getHotIssueQuestionData();

  return (
    <section className="container">
      <article className="banner__wrapper">{/* 배너 영역 */}</article>
      <article className="wrapper">
        <div className="greeting__card__wrapper">
          <GreetingSwiper />
        </div>
        <QuestionBanner questionData={hotIssueList?.[0]} />
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
