export const RECENT_RECRUIT_STORAGE_KEY = "nklcb__recent-recruit";
const MAX_RECENT_RECRUIT_ITEMS = 20;

export type RecentRecruitItem = {
  recruitmentNoticeId: number;
  path: string;
  companyName: string;
  title: string;
  position?: string;
  viewedAt: string;
};

const parseRecentRecruitItems = (value: string | null): RecentRecruitItem[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item) => {
      return (
        typeof item?.recruitmentNoticeId === "number" &&
        typeof item?.path === "string" &&
        typeof item?.companyName === "string" &&
        typeof item?.title === "string" &&
        typeof item?.viewedAt === "string"
      );
    });
  } catch (error) {
    console.error("Failed to parse recent recruit data:", error);
    return [];
  }
};

export const getRecentRecruitItems = (): RecentRecruitItem[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const rawValue = window.localStorage.getItem(RECENT_RECRUIT_STORAGE_KEY);
  return parseRecentRecruitItems(rawValue);
};

export const saveRecentRecruitItem = (
  item: Omit<RecentRecruitItem, "viewedAt">,
) => {
  if (typeof window === "undefined") {
    return;
  }

  const currentItems = getRecentRecruitItems();
  const nextItem: RecentRecruitItem = {
    ...item,
    viewedAt: new Date().toISOString(),
  };

  const deduplicated = currentItems.filter(
    (currentItem) =>
      currentItem.recruitmentNoticeId !== nextItem.recruitmentNoticeId,
  );

  const nextItems = [nextItem, ...deduplicated].slice(0, MAX_RECENT_RECRUIT_ITEMS);
  window.localStorage.setItem(
    RECENT_RECRUIT_STORAGE_KEY,
    JSON.stringify(nextItems),
  );
};

export const clearRecentRecruitItems = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(RECENT_RECRUIT_STORAGE_KEY);
};
