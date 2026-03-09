"use client";

import React, { useCallback, useEffect, useState } from "react";
import styles from "./career-tracker-floating.module.scss";
import {
  CAREER_TRACKER_SCRAP_ADDED_EVENT,
  CAREER_TRACKER_STORAGE_KEY,
} from "@/utils/careerTracker";

type CompanyStatus = "planned" | "applying" | "accepted" | "rejected";

type ChecklistItem = {
  id: string;
  text: string;
  done: boolean;
};

type ScrapItem = {
  id: string;
  recruitmentNoticeId: number;
  title: string;
  path: string;
  addedAt: string;
};

type CompanyBoardItem = {
  id: string;
  name: string;
  status: CompanyStatus;
  tasks: ChecklistItem[];
  scraps: ScrapItem[];
};

type TrackerTab = "todo" | "kanban" | "company";

type KanbanCardItem = {
  cardId: string;
  companyId: string;
  companyName: string;
  status: CompanyStatus;
  scrapCount: number;
  scrapTitle: string | null;
  pendingTaskCount: number;
  totalTaskCount: number;
};

const STATUS_META: ReadonlyArray<{
  key: CompanyStatus;
  label: string;
  emptyHint: string;
}> = [
  { key: "planned", label: "지원 예정", emptyHint: "지원 예정 항목이 아직 없어요." },
  { key: "applying", label: "지원 중", emptyHint: "지원 중인 공고가 아직 없어요." },
  { key: "accepted", label: "합격", emptyHint: "합격한 공고가 아직 없어요." },
  { key: "rejected", label: "불합격", emptyHint: "불합격 공고가 아직 없어요." },
];

const DEFAULT_TODOS: ChecklistItem[] = [
  { id: "todo-default-1", text: "오늘 지원할 공고 1개만 먼저 정하기", done: false },
  { id: "todo-default-2", text: "이력서 최신 버전 점검하기", done: false },
];

const getStatusLabel = (status: CompanyStatus) =>
  STATUS_META.find((meta) => meta.key === status)?.label ?? "";

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const isCompanyStatus = (value: unknown): value is CompanyStatus =>
  typeof value === "string" &&
  ["planned", "applying", "accepted", "rejected"].includes(value);

const toChecklistItemArray = (value: unknown): ChecklistItem[] => {
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

const toScrapItemArray = (value: unknown): ScrapItem[] => {
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

const toCompanyArray = (value: unknown): CompanyBoardItem[] => {
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
      isCompanyStatus(item.status)
    ) {
      const tasks =
        "tasks" in item ? toChecklistItemArray(item.tasks) : ([] as ChecklistItem[]);
      const scraps = "scraps" in item ? toScrapItemArray(item.scraps) : ([] as ScrapItem[]);

      return [{ id: item.id, name: item.name, status: item.status, tasks, scraps }];
    }

    return [];
  });
};

export default function CareerTrackerFloating() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [openStatusMenuCardId, setOpenStatusMenuCardId] = useState<string | null>(null);
  const [isScrapToastVisible, setIsScrapToastVisible] = useState(false);
  const [isStorageReady, setIsStorageReady] = useState(false);
  const [isStorageAvailable, setIsStorageAvailable] = useState(true);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [todos, setTodos] = useState<ChecklistItem[]>(DEFAULT_TODOS);
  const [companies, setCompanies] = useState<CompanyBoardItem[]>([]);
  const [draggingCompanyId, setDraggingCompanyId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<CompanyStatus | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [todoInput, setTodoInput] = useState("");
  const [companyInput, setCompanyInput] = useState("");
  const [taskInput, setTaskInput] = useState("");
  const [companySearchInput, setCompanySearchInput] = useState("");
  const [activeTab, setActiveTab] = useState<TrackerTab>("todo");

  const restoreFromStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(CAREER_TRACKER_STORAGE_KEY);
      if (!saved) {
        setCompanies([]);
        setSelectedCompanyId(null);
        return;
      }

      const parsed = JSON.parse(saved) as {
        todos?: unknown;
        companies?: unknown;
        selectedCompanyId?: unknown;
      };

      const restoredTodos = toChecklistItemArray(parsed.todos);
      const restoredCompanies = toCompanyArray(parsed.companies);

      if ("todos" in parsed) {
        setTodos(restoredTodos);
      }
      setCompanies(restoredCompanies);

      if (
        typeof parsed.selectedCompanyId === "string" &&
        restoredCompanies.some((company) => company.id === parsed.selectedCompanyId)
      ) {
        setSelectedCompanyId(parsed.selectedCompanyId);
      } else if (restoredCompanies.length > 0) {
        setSelectedCompanyId(restoredCompanies[0].id);
      } else {
        setSelectedCompanyId(null);
      }
    } catch (error) {
      console.error("Failed to parse career tracker storage", error);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscClose = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscClose);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener("keydown", handleEscClose);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleScrapAdded = () => {
      setIsScrapToastVisible(true);
      restoreFromStorage();
    };

    window.addEventListener(
      CAREER_TRACKER_SCRAP_ADDED_EVENT,
      handleScrapAdded as EventListener,
    );

    return () => {
      window.removeEventListener(
        CAREER_TRACKER_SCRAP_ADDED_EVENT,
        handleScrapAdded as EventListener,
      );
    };
  }, [restoreFromStorage]);

  useEffect(() => {
    try {
      const storageProbeKey = `${CAREER_TRACKER_STORAGE_KEY}-probe`;
      localStorage.setItem(storageProbeKey, "1");
      localStorage.removeItem(storageProbeKey);
    } catch {
      setIsStorageAvailable(false);
      setStorageWarning(
        "시크릿 모드 또는 브라우저 설정에 따라 내용 저장이 제한될 수 있어요. 새로고침 시 데이터가 사라질 수 있습니다.",
      );
      setIsStorageReady(true);
      return;
    }

    restoreFromStorage();
    setIsStorageReady(true);
  }, [restoreFromStorage]);

  useEffect(() => {
    if (isOpen) {
      setIsScrapToastVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || activeTab !== "kanban") {
      setOpenStatusMenuCardId(null);
    }
  }, [activeTab, isOpen]);

  useEffect(() => {
    if (!openStatusMenuCardId) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      if (target.closest(`.${styles["status-menu"]}`)) {
        return;
      }
      setOpenStatusMenuCardId(null);
    };

    const handleEscClose = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenStatusMenuCardId(null);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("touchstart", handlePointerDown);
    window.addEventListener("keydown", handleEscClose);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("keydown", handleEscClose);
    };
  }, [openStatusMenuCardId]);

  useEffect(() => {
    if (!isStorageReady || !isStorageAvailable) {
      return;
    }

    try {
      localStorage.setItem(
        CAREER_TRACKER_STORAGE_KEY,
        JSON.stringify({
          todos,
          companies,
          selectedCompanyId,
        }),
      );
    } catch (error) {
      console.error("Failed to persist career tracker storage", error);
      setIsStorageAvailable(false);
      setStorageWarning(
        "시크릿 모드 또는 브라우저 설정에 따라 내용 저장이 제한될 수 있어요. 새로고침 시 데이터가 사라질 수 있습니다.",
      );
    }
  }, [companies, isStorageAvailable, isStorageReady, selectedCompanyId, todos]);

  useEffect(() => {
    if (companies.length === 0) {
      if (selectedCompanyId !== null) {
        setSelectedCompanyId(null);
      }
      return;
    }

    if (!selectedCompanyId || !companies.some((company) => company.id === selectedCompanyId)) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId]);

  const selectedCompany =
    companies.find((company) => company.id === selectedCompanyId) ?? null;

  const handleAddTodo = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedText = todoInput.trim();
    if (!trimmedText) {
      return;
    }

    setTodos((prev) => [...prev, { id: createId(), text: trimmedText, done: false }]);
    setTodoInput("");
  };

  const toggleTodo = (todoId: string) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === todoId ? { ...todo, done: !todo.done } : todo)),
    );
  };

  const removeTodo = (todoId: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== todoId));
  };

  const clearCompletedTodos = () => {
    setTodos((prev) => prev.filter((todo) => !todo.done));
  };

  const handleAddCompany = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = companyInput.trim();
    if (!trimmedName) {
      return;
    }

    const newCompany: CompanyBoardItem = {
      id: createId(),
      name: trimmedName,
      status: "planned",
      tasks: [],
      scraps: [],
    };

    setCompanies((prev) => [...prev, newCompany]);
    setSelectedCompanyId(newCompany.id);
    setCompanyInput("");
  };

  const updateCompanyStatus = (companyId: string, status: CompanyStatus) => {
    setCompanies((prev) =>
      prev.map((company) => (company.id === companyId ? { ...company, status } : company)),
    );
  };

  const handleCompanyDragStart = (companyId: string) => {
    setDraggingCompanyId(companyId);
  };

  const handleCompanyDragEnd = () => {
    setDraggingCompanyId(null);
    setDragOverStatus(null);
  };

  const handleColumnDrop = (status: CompanyStatus) => {
    if (!draggingCompanyId) {
      return;
    }

    updateCompanyStatus(draggingCompanyId, status);
    setDraggingCompanyId(null);
    setDragOverStatus(null);
  };

  const removeCompany = (companyId: string) => {
    setCompanies((prev) => prev.filter((company) => company.id !== companyId));
  };

  const handleAddCompanyTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedCompany) {
      return;
    }

    const trimmedTask = taskInput.trim();
    if (!trimmedTask) {
      return;
    }

    setCompanies((prev) =>
      prev.map((company) =>
        company.id === selectedCompany.id
          ? {
              ...company,
              tasks: [...company.tasks, { id: createId(), text: trimmedTask, done: false }],
            }
          : company,
      ),
    );
    setTaskInput("");
  };

  const toggleCompanyTask = (companyId: string, taskId: string) => {
    setCompanies((prev) =>
      prev.map((company) =>
        company.id === companyId
          ? {
              ...company,
              tasks: company.tasks.map((task) =>
                task.id === taskId ? { ...task, done: !task.done } : task,
              ),
            }
          : company,
      ),
    );
  };

  const removeCompanyTask = (companyId: string, taskId: string) => {
    setCompanies((prev) =>
      prev.map((company) =>
        company.id === companyId
          ? { ...company, tasks: company.tasks.filter((task) => task.id !== taskId) }
          : company,
      ),
    );
  };

  const clearCompletedCompanyTasks = (companyId: string) => {
    setCompanies((prev) =>
      prev.map((company) =>
        company.id === companyId
          ? { ...company, tasks: company.tasks.filter((task) => !task.done) }
          : company,
      ),
    );
  };

  const normalizedCompanySearch = companySearchInput.trim().toLowerCase();
  const completedTodoCount = todos.filter((todo) => todo.done).length;
  const pendingTodoCount = todos.filter((todo) => !todo.done).length;
  const completedSelectedCompanyTaskCount =
    selectedCompany?.tasks.filter((task) => task.done).length ?? 0;
  const pendingSelectedCompanyTaskCount =
    selectedCompany?.tasks.filter((task) => !task.done).length ?? 0;
  const totalCompanyCount = companies.length;
  const totalScrapCount = companies.reduce(
    (acc, company) => acc + company.scraps.length,
    0,
  );
  const kanbanCards: KanbanCardItem[] = companies.flatMap((company) => {
    const pendingTaskCount = company.tasks.filter((task) => !task.done).length;
    const totalTaskCount = company.tasks.length;

    if (company.scraps.length === 0) {
      return [
        {
          cardId: `${company.id}-empty`,
          companyId: company.id,
          companyName: company.name,
          status: company.status,
          scrapCount: 0,
          scrapTitle: null,
          pendingTaskCount,
          totalTaskCount,
        },
      ];
    }

    return company.scraps.map((scrap) => ({
      cardId: scrap.id,
      companyId: company.id,
      companyName: company.name,
      status: company.status,
      scrapCount: company.scraps.length,
      scrapTitle: scrap.title,
      pendingTaskCount,
      totalTaskCount,
    }));
  });

  const getKanbanCardsByStatus = (status: CompanyStatus) =>
    kanbanCards.filter((card) => {
      if (card.status !== status) {
        return false;
      }
      if (!normalizedCompanySearch) {
        return true;
      }

      return (
        card.companyName.toLowerCase().includes(normalizedCompanySearch) ||
        (card.scrapTitle?.toLowerCase().includes(normalizedCompanySearch) ?? false)
      );
    });

  const handleTrackerToggle = () => {
    setIsScrapToastVisible(false);
    setIsOpen((prev) => !prev);
  };

  return (
    <div className={styles["tracker-root"]}>
      <button
        type="button"
        className={`${styles["panel-backdrop"]} ${isOpen ? styles["backdrop-open"] : styles["backdrop-closed"]}`}
        onClick={() => setIsOpen(false)}
        aria-label="작업실 닫기"
      />
      <aside
        id="career-tracker-panel"
        className={`${styles["tracker-panel"]} ${isOpen ? styles["panel-open"] : styles["panel-closed"]} ${isExpanded ? styles["panel-expanded"] : ""}`}
        aria-hidden={!isOpen}
      >
        <div className={styles["panel-header"]}>
          <div>
            <h2>작업실</h2>
            <p>할 일과 스크랩한 공고를 한곳에서 정리해보세요</p>
          </div>
          <div className={styles["panel-header-actions"]}>
            <button
              type="button"
              className={styles["panel-expand-button"]}
              onClick={() => setIsExpanded((prev) => !prev)}
              aria-label={isExpanded ? "작업실 기본 너비로 보기" : "작업실 풀너비로 보기"}
              title={isExpanded ? "기본 너비" : "풀너비"}
            >
              {isExpanded ? "기본" : "넓게"}
            </button>
            <button
              type="button"
              className={styles["panel-close-button"]}
              onClick={() => setIsOpen(false)}
              aria-label="작업실 닫기"
            >
              ×
            </button>
          </div>
        </div>
        {storageWarning ? <p className={styles["storage-warning"]}>{storageWarning}</p> : null}

        <div className={styles["panel-tabs"]}>
          <button
            type="button"
            className={`${styles["panel-tab"]} ${activeTab === "todo" ? styles["panel-tab-active"] : ""}`}
            onClick={() => setActiveTab("todo")}
          >
            오늘 작업
            <span>{pendingTodoCount}</span>
          </button>
          <button
            type="button"
            className={`${styles["panel-tab"]} ${activeTab === "kanban" ? styles["panel-tab-active"] : ""}`}
            onClick={() => setActiveTab("kanban")}
          >
            스크랩 공고
            <span>{totalScrapCount}</span>
          </button>
          <button
            type="button"
            className={`${styles["panel-tab"]} ${activeTab === "company" ? styles["panel-tab-active"] : ""}`}
            onClick={() => setActiveTab("company")}
          >
            기업 노트
            <span>{pendingSelectedCompanyTaskCount}</span>
          </button>
        </div>

        <div className={styles["panel-metrics"]}>
          <article>
            <strong>{pendingTodoCount}</strong>
            <span>오늘 할 일</span>
          </article>
          <article>
            <strong>{totalCompanyCount}</strong>
            <span>스크랩 기업</span>
          </article>
          <article>
            <strong>{totalScrapCount}</strong>
            <span>스크랩 공고</span>
          </article>
        </div>

        <div className={styles["panel-content"]}>
          {activeTab === "todo" ? (
            <section className={styles["panel-section"]}>
              <div className={styles["section-heading"]}>
                <h3>오늘의 작업 목록</h3>
                <span>
                  {completedTodoCount}/{todos.length}
                </span>
              </div>
              <div className={styles["action-row"]}>
                <button
                  type="button"
                  onClick={clearCompletedTodos}
                  disabled={completedTodoCount === 0}
                >
                  완료한 항목 정리
                </button>
              </div>
              <form className={styles["inline-form"]} onSubmit={handleAddTodo}>
                <input
                  type="text"
                  value={todoInput}
                  onChange={(event) => setTodoInput(event.target.value)}
                  placeholder="예: 코딩테스트 1문제 풀기"
                  aria-label="오늘 할 일 입력"
                />
                <button type="submit">등록</button>
              </form>
              <ul className={styles["checklist"]}>
                {todos.map((todo) => (
                  <li key={todo.id}>
                    <label className={todo.done ? styles["done-item"] : ""}>
                      <input
                        type="checkbox"
                        checked={todo.done}
                        onChange={() => toggleTodo(todo.id)}
                      />
                      <span>{todo.text}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => removeTodo(todo.id)}
                      aria-label="할 일 삭제"
                    >
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {activeTab === "kanban" ? (
            <section className={styles["panel-section"]}>
              <div className={styles["section-heading"]}>
                <h3>스크랩한 공고</h3>
                <span>{totalScrapCount}개 공고</span>
              </div>
              <article className={styles["scrap-overview"]}>
                <strong>{totalScrapCount}</strong>
                <p>저장한 공고를 카드로 모아보고, 진행 상태를 쉽게 바꿔보세요.</p>
              </article>
              <div className={styles["inline-form"]}>
                <input
                  type="text"
                  value={companySearchInput}
                  onChange={(event) => setCompanySearchInput(event.target.value)}
                  placeholder="기업명 또는 공고 제목 검색"
                  aria-label="스크랩 공고 검색"
                />
              </div>
              <form className={styles["inline-form"]} onSubmit={handleAddCompany}>
                <input
                  type="text"
                  value={companyInput}
                  onChange={(event) => setCompanyInput(event.target.value)}
                  placeholder="예: 토스"
                  aria-label="기업명 입력"
                />
                <button type="submit">추가</button>
              </form>

              <p className={styles["kanban-hint"]}>
                카드를 드래그하거나 상태 선택으로 바로 이동할 수 있어요.
              </p>

              <div className={styles["kanban-status-row"]}>
                {STATUS_META.map((status) => (
                  <span key={status.key} className={styles["kanban-status-chip"]}>
                    {status.label} {getKanbanCardsByStatus(status.key).length}
                  </span>
                ))}
              </div>

              <div className={styles["kanban-board"]}>
                {STATUS_META.map((status) => {
                  const items = getKanbanCardsByStatus(status.key);

                  return (
                    <article
                      key={status.key}
                      className={`${styles["kanban-column"]} ${dragOverStatus === status.key ? styles["kanban-column-drop-target"] : ""}`}
                      onDragOver={(event) => {
                        event.preventDefault();
                        if (dragOverStatus !== status.key) {
                          setDragOverStatus(status.key);
                        }
                      }}
                      onDragEnter={() => setDragOverStatus(status.key)}
                      onDragLeave={(event) => {
                        const nextTarget = event.relatedTarget as Node | null;
                        if (nextTarget && event.currentTarget.contains(nextTarget)) {
                          return;
                        }
                        if (dragOverStatus === status.key) {
                          setDragOverStatus(null);
                        }
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        handleColumnDrop(status.key);
                      }}
                    >
                      <header>
                        <h4>{status.label}</h4>
                        <span>{items.length}</span>
                      </header>
                      <div className={styles["kanban-list"]}>
                        {items.length === 0 ? (
                          <p className={styles["empty-state"]}>{status.emptyHint}</p>
                        ) : (
                          items.map((card) => (
                            <div
                              key={card.cardId}
                              className={`${styles["kanban-card"]} ${selectedCompanyId === card.companyId ? styles["kanban-card-active"] : ""} ${draggingCompanyId === card.companyId ? styles["kanban-card-dragging"] : ""}`}
                              draggable
                              onDragStart={() => handleCompanyDragStart(card.companyId)}
                              onDragEnd={handleCompanyDragEnd}
                            >
                              <div className={styles["kanban-card-top"]}>
                                <button
                                  type="button"
                                  className={styles["company-focus-button"]}
                                  onClick={() => {
                                    setSelectedCompanyId(card.companyId);
                                    setActiveTab("company");
                                  }}
                                >
                                  {card.companyName}
                                </button>
                                <span className={styles["kanban-card-status"]}>
                                  {getStatusLabel(card.status)}
                                </span>
                              </div>
                              <p className={styles["kanban-card-scrap-count"]}>
                                스크랩 공고 {card.scrapCount}개
                              </p>
                              {card.scrapTitle ? (
                                <p className={styles["kanban-card-scrap-title"]}>
                                  공고: {card.scrapTitle}
                                </p>
                              ) : null}
                              <div className={styles["kanban-card-footer"]}>
                                <span>
                                  남은 할 일 {card.pendingTaskCount}/{card.totalTaskCount}
                                </span>
                                <div className={styles["status-menu"]}>
                                  <button
                                    type="button"
                                    className={`${styles["status-menu-trigger"]} ${openStatusMenuCardId === card.cardId ? styles["status-menu-trigger-open"] : ""}`}
                                    onClick={() =>
                                      setOpenStatusMenuCardId((prev) =>
                                        prev === card.cardId ? null : card.cardId,
                                      )
                                    }
                                    aria-haspopup="menu"
                                    aria-expanded={openStatusMenuCardId === card.cardId}
                                    aria-label={`${card.companyName} 상태 변경`}
                                  >
                                    <span>{getStatusLabel(card.status)}</span>
                                    <span className={styles["status-menu-caret"]} aria-hidden="true">
                                      ▾
                                    </span>
                                  </button>
                                  {openStatusMenuCardId === card.cardId ? (
                                    <div
                                      className={styles["status-menu-list"]}
                                      role="menu"
                                      aria-label={`${card.companyName} 상태 선택`}
                                    >
                                      {STATUS_META.map((option) => {
                                        const isCurrent = option.key === card.status;

                                        return (
                                          <button
                                            key={option.key}
                                            type="button"
                                            role="menuitemradio"
                                            aria-checked={isCurrent}
                                            className={`${styles["status-menu-option"]} ${isCurrent ? styles["status-menu-option-active"] : ""}`}
                                            onClick={() => {
                                              updateCompanyStatus(card.companyId, option.key);
                                              setOpenStatusMenuCardId(null);
                                            }}
                                          >
                                            <span>{option.label}</span>
                                            {isCurrent ? (
                                              <span
                                                className={styles["status-menu-check"]}
                                                aria-hidden="true"
                                              >
                                                ✓
                                              </span>
                                            ) : null}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}

          {activeTab === "company" ? (
            <section className={styles["panel-section"]}>
              <div className={styles["section-heading"]}>
                <h3>기업별 작업 노트</h3>
                <span>{selectedCompany ? selectedCompany.name : "기업을 먼저 선택하세요"}</span>
              </div>

              {companies.length > 0 ? (
                <div className={styles["company-switcher"]}>
                  {companies.map((company) => {
                    const isActive = selectedCompany?.id === company.id;

                    return (
                      <button
                        key={company.id}
                        type="button"
                        className={`${styles["company-switcher-button"]} ${isActive ? styles["company-switcher-button-active"] : ""}`}
                        onClick={() => setSelectedCompanyId(company.id)}
                      >
                        <strong>{company.name}</strong>
                        <span>
                          공고 {company.scraps.length} · 할 일 {company.tasks.length}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              {!selectedCompany ? (
                <p className={styles["empty-state"]}>
                  스크랩 공고 탭에서 기업 카드를 눌러주세요.
                </p>
              ) : (
                <>
                  <div className={styles["selected-company-row"]}>
                    <strong>{selectedCompany.name}</strong>
                    <button
                      type="button"
                      className={styles["delete-company-button"]}
                      onClick={() => removeCompany(selectedCompany.id)}
                    >
                      기업 삭제
                    </button>
                  </div>
                  <section className={styles["scrap-list-section"]}>
                    <h4>스크랩한 공고</h4>
                    {selectedCompany.scraps.length === 0 ? (
                      <p className={styles["empty-state"]}>아직 스크랩한 공고가 없어요.</p>
                    ) : (
                      <ul className={styles["scrap-list"]}>
                        {selectedCompany.scraps.map((scrap) => (
                          <li key={scrap.id}>
                            <button
                              type="button"
                              onClick={() =>
                                window.open(
                                  `/recruitment-notices?id=${scrap.recruitmentNoticeId}&path=${scrap.path}`,
                                  "_blank",
                                )
                              }
                            >
                              {scrap.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                  <form className={styles["inline-form"]} onSubmit={handleAddCompanyTask}>
                    <input
                      type="text"
                      value={taskInput}
                      onChange={(event) => setTaskInput(event.target.value)}
                      placeholder={`${selectedCompany.name} 관련 할 일을 입력하세요`}
                      aria-label="기업별 할 일 입력"
                    />
                    <button type="submit">등록</button>
                  </form>
                  <div className={styles["action-row"]}>
                    <button
                      type="button"
                      onClick={() => clearCompletedCompanyTasks(selectedCompany.id)}
                      disabled={completedSelectedCompanyTaskCount === 0}
                    >
                      완료한 항목 정리
                    </button>
                  </div>
                  <ul className={styles["checklist"]}>
                    {selectedCompany.tasks.length === 0 ? (
                      <li className={styles["empty-checklist"]}>등록된 할 일이 없어요.</li>
                    ) : (
                      selectedCompany.tasks.map((task) => (
                        <li key={task.id}>
                          <label className={task.done ? styles["done-item"] : ""}>
                            <input
                              type="checkbox"
                              checked={task.done}
                              onChange={() =>
                                toggleCompanyTask(selectedCompany.id, task.id)
                              }
                            />
                            <span>{task.text}</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => removeCompanyTask(selectedCompany.id, task.id)}
                            aria-label="기업 할 일 삭제"
                          >
                            삭제
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </>
              )}
            </section>
          ) : null}
        </div>
      </aside>

      {isScrapToastVisible && !isOpen ? (
        <p className={styles["scrap-toast"]} role="status" aria-live="polite">
          기업 공고가 내 스크랩에 담겼어요
        </p>
      ) : null}

      <button
        type="button"
        className={`${styles["tracker-tag"]} ${isOpen ? styles["tracker-tag-open"] : ""}`}
        onClick={handleTrackerToggle}
        aria-expanded={isOpen}
        aria-controls="career-tracker-panel"
        aria-label={isOpen ? "작업실 닫기" : "작업실 열기"}
        title={isOpen ? "작업실 닫기" : "작업실 열기"}
      >
        {isOpen ? (
          <span className={styles["tracker-symbol"]} aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </span>
        ) : (
          <span className={styles["tracker-symbol"]} aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M8 4h8l1 2h2a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h2l1-2z" />
              <path d="M8 11h8M8 15h5" />
            </svg>
          </span>
        )}
      </button>
    </div>
  );
}
