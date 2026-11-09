import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/api";
import DefaultLayout from "@/components/layout/DefaultLayout";
import interviewData from "@/data/interview-questions.json";
import remoteData from "@/data/remote-work-companies.kr.json";
import styles from "./page.module.scss";
import { scaledPositionName } from "@/utils/common";

export const dynamic = "force-dynamic";

const PAGE_URL = "https://nklcb.kr/discover";
const DESCRIPTION =
  "최근 목록에서 고른 개발자 채용 공고, 한국 날짜로 고른 오늘의 기술 인터뷰 질문, 과거 공개 자료에 기록된 원격 근무 유형을 함께 확인하세요.";

export const metadata: Metadata = {
  title: "개발자 취업 탐색 | 채용·면접 질문·원격 근무 가이드",
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "개발자 취업 탐색 | 채용·면접 질문·원격 근무 가이드",
    description: DESCRIPTION,
    url: PAGE_URL,
    type: "website",
    locale: "ko_KR",
  },
  robots: { index: true, follow: true },
};

type Recruitment = {
  recruitmentNoticeId: number;
  companyName: string;
  corporates?: { corporateName: string }[];
  jobOfferTitle: string;
  standardCategory?: string;
  categories?: string[];
  startAt?: string;
  endAt?: string;
  url: string;
};

const developerPattern =
  /개발|엔지니어|프론트.?엔드|백.?엔드|풀.?스택|데브옵스|소프트웨어|플랫폼|인프라|SRE|DevOps|Developer|Engineer|Frontend|Backend|Fullstack|Software|iOS|Android|안드로이드|데이터 엔지니어/i;

function validJob(item: Recruitment, koreanDate: string): boolean {
  if (!Number.isFinite(item.recruitmentNoticeId) || !item.jobOfferTitle)
    return false;
  const searchable = [
    item.jobOfferTitle,
    item.standardCategory,
    ...(item.categories ?? []),
  ].join(" ");
  if (!developerPattern.test(searchable)) return false;
  if (
    item.endAt &&
    /^\d{4}-\d{2}-\d{2}/.test(item.endAt) &&
    !item.endAt.startsWith("9999") &&
    item.endAt.slice(0, 10) < koreanDate
  )
    return false;
  try {
    return ["https:", "http:"].includes(new URL(item.url).protocol);
  } catch {
    return false;
  }
}

async function getDeveloperJobs(
  koreanDate: string,
): Promise<{ jobs: Recruitment[]; failed: boolean }> {
  // The first two pages are a sample of recent API listings, not an exhaustive weekly census.
  const results = await Promise.allSettled(
    [0, 1].map((page) =>
      api.get<{ list: Recruitment[] }>("/recruitment-notices/redirections", {
        params: { page, pageSize: 20 },
      }),
    ),
  );
  const failed = results.every((result) => result.status === "rejected");
  const jobs = results.flatMap((result) =>
    result.status === "fulfilled" && Array.isArray(result.value.data?.list)
      ? result.value.data.list
      : [],
  );
  return {
    jobs: [
      ...new Map(
        jobs
          .filter((job) => validJob(job, koreanDate))
          .map((job) => [job.recruitmentNoticeId, job]),
      ).values(),
    ].slice(0, 6),
    failed,
  };
}

const questions = interviewData.frontend.categories.flatMap((category) =>
  category.questions.map((question) => ({
    ...question,
    track: interviewData.frontend.label,
    category: category.label,
  })),
);
const remoteEligible = remoteData.companies.filter(
  (company) => company.isRemotePossible,
);
const fullCount = remoteEligible.filter(
  (company) => company.remoteCategory === "full",
).length;
const partialCount = remoteEligible.filter(
  (company) => company.remoteCategory === "partial",
).length;

export default async function DiscoverPage() {
  const now = new Date();
  const koreanDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const day = Math.floor(
    Date.parse(`${koreanDate}T00:00:00.000Z`) / 86_400_000,
  );
  const question = questions.length
    ? questions[
        ((day % questions.length) + questions.length) % questions.length
      ]
    : null;
  const { jobs, failed } = await getDeveloperJobs(koreanDate);

  return (
    <DefaultLayout>
      <main className={styles.page}>
        <header className={styles.hero}>
          <h1>개발자 채용과 면접 준비</h1>
          <p>최근 공고에서 개발 직무를 찾고, 오늘의 면접 질문도 풀어보세요.</p>
        </header>

        <section
          id="jobs"
          className={styles.section}
          aria-labelledby="discover-jobs"
        >
          <div className={styles.sectionHeader}>
            <div>
              <h2 id="discover-jobs">최근 개발 직무 공고</h2>
            </div>
            <Link href="/web">채용 목록 더 보기</Link>
          </div>
          <p>
            최근 공고에서 개발 관련 직무를 골랐어요. 지원 전 마감일은 꼭 확인해
            주세요.
          </p>
          {jobs.length ? (
            <ul className={styles.jobList}>
              {jobs.map((job) => (
                <li key={job.recruitmentNoticeId} className={styles.jobCard}>
                  <span className={styles.tag}>
                    {job.standardCategory
                      ? scaledPositionName(job.standardCategory)
                      : "개발 관련 직무"}
                  </span>
                  <h3>
                    <a href={job.url} target="_blank" rel="noopener noreferrer">
                      {job.jobOfferTitle}
                    </a>
                  </h3>
                  <p>
                    {job.corporates?.[0]?.corporateName ||
                      job.companyName ||
                      "회사명 미제공"}
                  </p>
                  {job.endAt && (
                    <p>API 기록상 마감일: {job.endAt.slice(0, 10)}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty} role="status">
              {failed
                ? "채용 API에 연결하지 못해 공고를 표시할 수 없습니다."
                : "조회한 최신 목록에서 개발 관련 공고를 찾지 못했습니다."}{" "}
              <Link href="/web">전체 채용 목록 확인하기</Link>
            </p>
          )}
          <p className={styles.note}>
            최근 40건의 제목·직무 분류를 기준으로 골랐습니다. 빠진 공고가 있을
            수 있어요.
          </p>
        </section>

        <section
          id="interview"
          className={styles.section}
          aria-labelledby="discover-interview"
        >
          <div className={styles.sectionHeader}>
            <div>
              <h2 id="discover-interview">오늘의 기술 인터뷰 질문</h2>
            </div>
            <Link href="/interview-questions">질문 모음 보기</Link>
          </div>
          <p>
            먼저 소리 내어 답해보고, 막히는 부분을 질문 모음에서 확인해 보세요.
          </p>
          {question ? (
            <div className={styles.question}>
              <p className={styles.tag}>
                {koreanDate} · {question.track} / {question.category}
              </p>
              <h3>{question.title}</h3>
              <Link href="/interview-questions">관련 질문과 답변 살펴보기</Link>
            </div>
          ) : (
            <p className={styles.empty}>
              표시할 질문이 없습니다.{" "}
              <Link href="/interview-questions">질문 모음 보기</Link>
            </p>
          )}
          <p className={styles.note}>
            매일메일 공개 질문에서 한국 날짜를 기준으로 하루 한 문항을
            보여줍니다.
          </p>
        </section>

        <section
          id="remote"
          className={styles.section}
          aria-labelledby="discover-remote"
        >
          <div className={styles.sectionHeader}>
            <div>
              <h2 id="discover-remote">원격 근무 비교 가이드</h2>
            </div>
            <Link href="/remote-work-companies">회사별 기록 보기</Link>
          </div>
          <p>
            재택 가능 여부뿐 아니라 출근일, 근무 장소, 팀 승인 조건도 함께
            보세요.
          </p>
          <div className={styles.compare}>
            <div>
              <h3>
                기록상 완전 원격 <span>{fullCount}곳</span>
              </h3>
              <p>
                상시 출근 요건이 있는지, 거주지·시간대 제한과 대면 행사 의무가
                있는지 확인하세요.
              </p>
              <Link href="/remote-work-companies?type=full">
                해당 기록 살펴보기
              </Link>
            </div>
            <div>
              <h3>
                기록상 부분 원격 <span>{partialCount}곳</span>
              </h3>
              <p>
                주당 재택 가능 일수와 고정 출근일, 팀·직무별 예외, 승인 절차를
                확인하세요.
              </p>
              <Link href="/remote-work-companies?type=partial">
                해당 기록 살펴보기
              </Link>
            </div>
          </div>
          <p className={styles.warning}>
            이 목록은 회사별 확인일이 없는 과거 기록입니다. 현재 정책은 각 회사
            채용 페이지에서 확인해 주세요.
          </p>
          <p className={styles.note}>
            <a
              href={remoteData.source}
              target="_blank"
              rel="noopener noreferrer"
            >
              원본 자료
            </a>{" "}
            · 파일 생성일 {remoteData.generatedAt.slice(0, 10)} (회사별 확인일
            아님)
          </p>
        </section>
      </main>
    </DefaultLayout>
  );
}
