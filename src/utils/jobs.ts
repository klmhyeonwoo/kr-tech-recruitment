import type { RecruitData } from "@/components/card/Section";

export type JobItem = RecruitData;

export const DAY = 86_400_000;

/** 카드에 보여줄 회사 이름 (계열사가 여러 곳이면 "A 외 N개") */
export function companyLabel(item: JobItem) {
  const [first, ...rest] = item.corporates ?? [];
  if (!first) return item.companyName;
  return rest.length ? `${first.corporateName} 외 ${rest.length}개` : first.corporateName;
}

/** 상시 채용(마감일 없음 · 9999년)인지 */
export function isOpenEnded(endAt?: string | null) {
  return !endAt || endAt.includes("9999");
}

export type Deadline = { label: string; tone: "open" | "urgent" | "normal" | "closed"; days: number | null };

/** 한국 시간 기준 날짜 차이로 D-day 를 계산합니다. */
export function deadlineOf(endAt?: string | null, now = Date.now()): Deadline {
  if (isOpenEnded(endAt)) return { label: "상시 채용", tone: "open", days: null };
  const kstDay = (time: number) => Math.floor((time + 9 * 3_600_000) / DAY);
  const days = kstDay(new Date(endAt as string).getTime()) - kstDay(now);
  if (Number.isNaN(days)) return { label: "상시 채용", tone: "open", days: null };
  if (days < 0) return { label: "마감", tone: "closed", days };
  if (days === 0) return { label: "오늘 마감", tone: "urgent", days };
  return { label: `D-${days}`, tone: days <= 3 ? "urgent" : "normal", days };
}

const shortDate = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "2-digit", day: "2-digit" });

export function periodLabel(startAt?: string | null, endAt?: string | null) {
  const fmt = (value: string) => shortDate.format(new Date(value)).replace(/\. /g, ".").replace(/\.$/, "");
  if (!startAt) return isOpenEnded(endAt) ? "" : `~ ${fmt(endAt as string)}`;
  if (isOpenEnded(endAt)) return `${fmt(startAt)} ~ 상시`;
  return `${fmt(startAt)} ~ ${fmt(endAt as string)}`;
}

/** 회사 이름에서 항상 같은 색조를 만듭니다. (로고가 없는 회사용 이니셜 아바타) */
export function hueOf(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 360;
  return hash;
}

export function jobHref(item: JobItem) {
  return `/recruitment-notices?${new URLSearchParams({ id: String(item.recruitmentNoticeId), path: item.url })}`;
}

/** 경력/신입 구분이 제목에 들어 있을 때만 뽑아냅니다. (없으면 만들지 않아요) */
export function careerTag(title: string) {
  const hasNew = /신입/.test(title);
  const hasExp = /경력/.test(title);
  if (hasNew && hasExp) return "신입·경력";
  if (hasNew) return "신입";
  if (hasExp) return "경력";
  return null;
}
