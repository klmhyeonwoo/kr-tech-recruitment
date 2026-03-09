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

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const isCareerTrackerStatus = (value: unknown): value is CareerTrackerStatus =>
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

const toScrapArray = (value: unknown): CareerTrackerScrapItem[] => {
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
      return [
        {
          id: item.id,
          recruitmentNoticeId: item.recruitmentNoticeId,
          title: item.title,
          path: item.path,
          addedAt: item.addedAt,
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
        "scraps" in item ? toScrapArray(item.scraps) : ([] as CareerTrackerScrapItem[]);

      return [{ id: item.id, name: item.name, status: item.status, tasks, scraps }];
    }

    return [];
  });
};

const getCareerTrackerStorage = (): CareerTrackerStorageShape => {
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
    const existingCompanyIndex = previous.companies.findIndex(
      (company) =>
        company.name.trim().toLowerCase() === trimmedCompanyName.toLowerCase(),
    );
    const nextScrap: CareerTrackerScrapItem = {
      id: createId(),
      recruitmentNoticeId,
      title: trimmedTitle,
      path,
      addedAt: new Date().toISOString(),
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
    return true;
  } catch (error) {
    console.error("Failed to save company to career tracker:", error);
    return false;
  }
};
