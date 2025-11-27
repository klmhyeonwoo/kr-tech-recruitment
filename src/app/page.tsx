import AnnounceCard from "@/components/card/AnnounceCard";
import "@/styles/domain/main.scss";
import { api } from "@/api";
import GreetingSwiper from "@/components/swiper/GreetingSwiper";
import QuestionBanner from "@/components/question/question-banner";
import { Fragment } from "react";
import Header from "@/components/common/header";
import hotIssue from "@/api/domain/hotIssue";
import community from "@/api/domain/community";
import ListItem from "@/components/commnuity/list-item";
import { ListProps } from "@/components/commnuity/list";
import Ads from "@/components/ads/ads";
import UserAds from "@/components/ads/user-ads";
import Anchor from "@/components/common/anchor";

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

async function getCommunityData() {
  try {
    const { data } = await community.standardList({
      page: 0,
      pageSize: 3,
    });
    return data;
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
    const { data } = await hotIssue.getActivatedList();
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
  const { list: communityList } = await getCommunityData();

  return (
    <Fragment>
      <Header />
      <section className="container">
        <article className="banner__wrapper">{/* 배너 영역 */}</article>
        <article className="wrapper">
          <div className="greeting__card__wrapper" id="service-menu">
            <GreetingSwiper />
          </div>
          <QuestionBanner questionData={hotIssueList?.[0]} />
          <div id="community">
            <div className="d-flex flex-column row-gap-2">
              <span className="title"> 최근 커뮤니티 게시글 </span>
              <span className="description">
                다양한 주제로 올라온 게시글들을 확인해보세요
              </span>
              {communityList.map((item: ListProps["list"][number]) => (
                <ListItem
                  key={item.boardId}
                  id={item.boardId}
                  title={item.title}
                  content={item.content}
                  writer={item.nickname}
                  writerId={item.userId}
                  date={item.createdAt}
                  commentCount={item.comments.length}
                  likeCount={item.likes.length}
                />
              ))}
            </div>
            <Anchor href="/community" text="게시글 더 보러가기" />
          </div>
          <Ads />
          <div className="announce__card__wrapper" id="ranking-announce">
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
          <UserAds />
        </article>
        <article className="banner__wrapper">{/* 배너 영역 */}</article>
      </section>
    </Fragment>
  );
}
