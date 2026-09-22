import HomeRecruitments from "./_components/home-recruitments";
import "@/styles/domain/main.scss";
import PwaInstallBanner from "./_components/pwa-install-banner";
import { api } from "@/api";
import type { QuestionTypes } from "./question/_components/question-banner";
import { Fragment } from "react";
import Header from "@/components/common/navigation/header";
import hotIssue from "@/api/domain/hotIssue";
import community from "@/api/domain/community";
import { ListProps } from "./community/_components/list";
import HomeWorkspace from "./_components/home-workspace";
import UserAds from "@/components/ads/user-ads";
import Link from "next/link";
import { RecruitData } from "@/components/card/Section";
import MainCommunityListItem from "./_components/main-community-list-item";
import SubscriptionInvitation from "@/components/popup/subscription/invitation";

export const revalidate = 3600; // Revalidate every hour

type DataResponse<T> = { list: T[]; error?: unknown };

async function getRecruitData({
  params,
}: {
  params: {
    page: number;
    pageSize: number;
  };
}): Promise<DataResponse<RecruitData>> {
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
    return { list: [], error };
  }
}

async function getCommunityData(): Promise<
  DataResponse<ListProps["list"][number]>
> {
  try {
    const { data } = await community.standardList({
      page: 0,
      pageSize: 3,
    });
    return data;
  } catch (error) {
    return { list: [], error };
  }
}

async function getPopularRecruitData({
  params,
}: {
  params: {
    date: string;
  };
}): Promise<DataResponse<RecruitData>> {
  try {
    const { data } = await api.get(
      `/recruitment-notices/redirections/daily-rank`,
      {
        params,
      },
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
    return { list: [], error };
  }
}

async function getHotIssueQuestionData(): Promise<
  DataResponse<QuestionTypes["questionData"]>
> {
  try {
    const { data } = await hotIssue.getActivatedList();
    return data;
  } catch (error) {
    return { list: [], error };
  }
}

export default async function Home() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const [
    { list: recentRecruitList },
    { list: popularRecruitList },
    { list: hotIssueList },
    { list: communityList },
  ] = await Promise.all([
    getRecruitData({
      params: {
        page: 0,
        pageSize: 10,
      },
    }),
    getPopularRecruitData({
      params: {
        date: yesterday.toISOString().split("T")[0],
      },
    }),
    getHotIssueQuestionData(),
    getCommunityData(),
  ]);

  return (
    <Fragment>
      <Header wide />
      <HomeWorkspace extra={<>
          <section
            className="home-section home-overview"
            id="community"
            aria-labelledby="home-community-title"
          >
            <div className="home-section-heading">
              <h2 id="home-community-title">커뮤니티</h2>
              <Link href="/community" className="home-text-link">
                전체 보기 <span aria-hidden="true">›</span>
              </Link>
            </div>
            <div>
              {communityList.length ? (
                communityList.map((item: ListProps["list"][number]) => (
                  <MainCommunityListItem
                    key={item.boardId}
                    id={item.boardId}
                    title={item.title}
                    writer={item.nickname}
                    date={item.createdAt}
                  />
                ))
              ) : (
                <p className="home-empty">
                  아직 글이 없어요. 첫 글을 남겨 보세요.
                </p>
              )}
            </div>
          </section>
          {hotIssueList[0] && (
            <Link href="/question" className="home-question home-overview">
              <span>이번 주 질문</span>
              <strong>{hotIssueList[0].title}</strong>
              <span className="home-text-link">
                의견 나누기 <span aria-hidden="true">›</span>
              </span>
            </Link>
          )}
          <SubscriptionInvitation />
          <PwaInstallBanner />
          <UserAds />
          <footer className="home-footer">
            <nav aria-label="서비스 안내">
              <Link href="/question">이번 주 질문</Link>
              <a
                href="https://6oo1v.channel.io/home"
                target="_blank"
                rel="noopener noreferrer"
              >
                서비스 문의
              </a>
              <a
                href="https://github.com/klmhyeonwoo/kr-tech-recruitment/releases"
                target="_blank"
                rel="noopener noreferrer"
              >
                업데이트
              </a>
              <a
                href="https://github.com/klmhyeonwoo/kr-tech-recruitment"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </nav>
          </footer>
      </>}>
        <HomeRecruitments
          recent={recentRecruitList.slice(0, 5)}
          popular={popularRecruitList.slice(0, 5)}
        />
      </HomeWorkspace>
    </Fragment>
  );
}
