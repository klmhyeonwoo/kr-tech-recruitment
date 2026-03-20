export type CareerTrackerStatus = "planned" | "applying" | "accepted" | "rejected";

export type CareerTrackerChecklistItem = {
  id: string;
  text: string;
  done: boolean;
};

export type CareerTrackerScrapItem = {
  id: string;
  recruitmentNoticeId: number;
  title: string;
  path: string;
  addedAt: string;
  status: CareerTrackerStatus;
};

export type CareerTrackerCompanyItem = {
  id: string;
  name: string;
  status: CareerTrackerStatus;
  tasks: CareerTrackerChecklistItem[];
  scraps: CareerTrackerScrapItem[];
};

type CareerTrackerStorageShape = {
  todos: CareerTrackerChecklistItem[];
  companies: CareerTrackerCompanyItem[];
  selectedCompanyId: string | null;
};

export const CAREER_TRACKER_STORAGE_KEY = "nklcb-career-tracker-v1";
export const CAREER_TRACKER_SCRAP_ADDED_EVENT = "career-tracker:scrap-added";
export const CAREER_TRACKER_UPDATED_EVENT = "career-tracker:updated";

export const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const isCareerTrackerStatus = (value: unknown): value is CareerTrackerStatus =>
  typeof value === "string" &&
  ["planned", "applying", "accepted", "rejected"].includes(value);

const toChecklistItemArray = (value: unknown): CareerTrackerChecklistItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      "text" in item &&
      "done" in item &&
      typeof item.id === "string" &&
      typeof item.text === "string" &&
      typeof item.done === "boolean"
    ) {
      return [{ id: item.id, text: item.text, done: item.done }];
    }

    return [];
  });
};

const toScrapArray = (
  value: unknown,
  fallbackStatus: CareerTrackerStatus,
): CareerTrackerScrapItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      "recruitmentNoticeId" in item &&
      "title" in item &&
      "path" in item &&
      "addedAt" in item &&
      typeof item.id === "string" &&
      typeof item.recruitmentNoticeId === "number" &&
      typeof item.title === "string" &&
      typeof item.path === "string" &&
      typeof item.addedAt === "string"
    ) {
      const status =
        "status" in item && isCareerTrackerStatus(item.status)
          ? item.status
          : fallbackStatus;

      return [
        {
          id: item.id,
          recruitmentNoticeId: item.recruitmentNoticeId,
          title: item.title,
          path: item.path,
          addedAt: item.addedAt,
          status,
        },
      ];
    }

    return [];
  });
};

const toCompanyArray = (value: unknown): CareerTrackerCompanyItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      "name" in item &&
      "status" in item &&
      typeof item.id === "string" &&
      typeof item.name === "string" &&
      isCareerTrackerStatus(item.status)
    ) {
      const tasks =
        "tasks" in item ? toChecklistItemArray(item.tasks) : ([] as CareerTrackerChecklistItem[]);
      const scraps =
        "scraps" in item
          ? toScrapArray(item.scraps, item.status)
          : ([] as CareerTrackerScrapItem[]);

      return [{ id: item.id, name: item.name, status: item.status, tasks, scraps }];
    }

    return [];
  });
};

export const getCareerTrackerStorage = (): CareerTrackerStorageShape => {
  if (typeof window === "undefined") {
    return { todos: [], companies: [], selectedCompanyId: null };
  }

  const saved = window.localStorage.getItem(CAREER_TRACKER_STORAGE_KEY);
  if (!saved) {
    return { todos: [], companies: [], selectedCompanyId: null };
  }

  try {
    const parsed = JSON.parse(saved) as {
      todos?: unknown;
      companies?: unknown;
      selectedCompanyId?: unknown;
    };
    const todos = toChecklistItemArray(parsed.todos);
    const companies = toCompanyArray(parsed.companies);

    const selectedCompanyId =
      typeof parsed.selectedCompanyId === "string" &&
      companies.some((company) => company.id === parsed.selectedCompanyId)
        ? parsed.selectedCompanyId
        : null;

    return { todos, companies, selectedCompanyId };
  } catch (error) {
    console.error("Failed to parse career tracker data:", error);
    return { todos: [], companies: [], selectedCompanyId: null };
  }
};

const emitCareerTrackerUpdated = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(CAREER_TRACKER_UPDATED_EVENT));
};

const isSameCompanyName = (left: string, right: string) =>
  left.trim().toLowerCase() === right.trim().toLowerCase();

export const isCompanyScrappedInCareerTracker = (companyName: string) => {
  if (typeof window === "undefined") {
    return false;
  }

  const trimmedCompanyName = companyName.trim();
  if (!trimmedCompanyName) {
    return false;
  }

  const previous = getCareerTrackerStorage();
  return previous.companies.some((company) =>
    isSameCompanyName(company.name, trimmedCompanyName),
  );
};

export const isRecruitmentNoticeScrappedInCareerTracker = (
  recruitmentNoticeId: number,
) => {
  if (typeof window === "undefined") {
    return false;
  }

  if (!Number.isFinite(recruitmentNoticeId) || recruitmentNoticeId <= 0) {
    return false;
  }

  const previous = getCareerTrackerStorage();
  return previous.companies.some((company) =>
    company.scraps.some(
      (scrap) => scrap.recruitmentNoticeId === recruitmentNoticeId,
    ),
  );
};

export const removeRecruitmentNoticeFromCareerTracker = (
  recruitmentNoticeId: number,
) => {
  if (typeof window === "undefined") {
    return false;
  }

  if (!Number.isFinite(recruitmentNoticeId) || recruitmentNoticeId <= 0) {
    return false;
  }

  try {
    const previous = getCareerTrackerStorage();
    const hadTarget = previous.companies.some((company) =>
      company.scraps.some(
        (scrap) => scrap.recruitmentNoticeId === recruitmentNoticeId,
      ),
    );

    if (!hadTarget) {
      return false;
    }

    const companies = previous.companies
      .map((company) => ({
        ...company,
        scraps: company.scraps.filter(
          (scrap) => scrap.recruitmentNoticeId !== recruitmentNoticeId,
        ),
      }))
      .filter((company) => company.scraps.length > 0);

    const selectedCompanyId =
      typeof previous.selectedCompanyId === "string" &&
      companies.some((company) => company.id === previous.selectedCompanyId)
        ? previous.selectedCompanyId
        : (companies[0]?.id ?? null);

    window.localStorage.setItem(
      CAREER_TRACKER_STORAGE_KEY,
      JSON.stringify({
        todos: previous.todos,
        companies,
        selectedCompanyId,
      }),
    );

    emitCareerTrackerUpdated();
    return true;
  } catch (error) {
    console.error("Failed to remove recruitment notice from career tracker:", error);
    return false;
  }
};

export const removeCompanyFromCareerTracker = (companyName: string) => {
  if (typeof window === "undefined") {
    return false;
  }

  const trimmedCompanyName = companyName.trim();
  if (!trimmedCompanyName) {
    return false;
  }

  try {
    const previous = getCareerTrackerStorage();
    const targetCompany = previous.companies.find((company) =>
      isSameCompanyName(company.name, trimmedCompanyName),
    );

    if (!targetCompany) {
      return false;
    }

    const companies = previous.companies.filter(
      (company) => company.id !== targetCompany.id,
    );
    const selectedCompanyId =
      previous.selectedCompanyId === targetCompany.id
        ? (companies[0]?.id ?? null)
        : previous.selectedCompanyId;

    window.localStorage.setItem(
      CAREER_TRACKER_STORAGE_KEY,
      JSON.stringify({
        todos: previous.todos,
        companies,
        selectedCompanyId,
      }),
    );

    emitCareerTrackerUpdated();
    return true;
  } catch (error) {
    console.error("Failed to remove company from career tracker:", error);
    return false;
  }
};

export const saveCompanyToCareerTracker = ({
  companyName,
  recruitmentNoticeId,
  title,
  path,
}: {
  companyName: string;
  recruitmentNoticeId: number;
  title: string;
  path: string;
}) => {
  if (typeof window === "undefined") {
    return false;
  }

  const trimmedCompanyName = companyName.trim();
  const trimmedTitle = title.trim();

  if (!trimmedCompanyName || !trimmedTitle || !path || !recruitmentNoticeId) {
    return false;
  }

  try {
    const previous = getCareerTrackerStorage();
    const isAlreadyScrapped = previous.companies.some((company) =>
      company.scraps.some(
        (scrap) => scrap.recruitmentNoticeId === recruitmentNoticeId,
      ),
    );

    if (isAlreadyScrapped) {
      return false;
    }

    const existingCompanyIndex = previous.companies.findIndex((company) =>
      isSameCompanyName(company.name, trimmedCompanyName),
    );
    const nextScrap: CareerTrackerScrapItem = {
      id: createId(),
      recruitmentNoticeId,
      title: trimmedTitle,
      path,
      addedAt: new Date().toISOString(),
      status: "planned",
    };

    const companies = [...previous.companies];
    let targetCompanyId: string;

    if (existingCompanyIndex === -1) {
      const nextCompany: CareerTrackerCompanyItem = {
        id: createId(),
        name: trimmedCompanyName,
        status: "planned",
        tasks: [],
        scraps: [nextScrap],
      };
      companies.push(nextCompany);
      targetCompanyId = nextCompany.id;
    } else {
      const existingCompany = companies[existingCompanyIndex];
      const dedupedScraps = existingCompany.scraps.filter(
        (scrap) => scrap.recruitmentNoticeId !== recruitmentNoticeId,
      );
      const nextCompany: CareerTrackerCompanyItem = {
        ...existingCompany,
        scraps: [nextScrap, ...dedupedScraps],
      };
      companies[existingCompanyIndex] = nextCompany;
      targetCompanyId = nextCompany.id;
    }

    window.localStorage.setItem(
      CAREER_TRACKER_STORAGE_KEY,
      JSON.stringify({
        todos: previous.todos,
        companies,
        selectedCompanyId: targetCompanyId,
      }),
    );

    window.dispatchEvent(
      new CustomEvent(CAREER_TRACKER_SCRAP_ADDED_EVENT, {
        detail: {
          companyName: trimmedCompanyName,
          recruitmentNoticeId,
        },
      }),
    );
    emitCareerTrackerUpdated();
    return true;
  } catch (error) {
    console.error("Failed to save company to career tracker:", error);
    return false;
  }
};
