"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./career-tracker-floating.module.scss";
import {
  CAREER_TRACKER_SCRAP_ADDED_EVENT,
  CAREER_TRACKER_STORAGE_KEY,
  CAREER_TRACKER_UPDATED_EVENT,
  createId,
  getCareerTrackerStorage,
  isCareerTrackerStatus,
  type CareerTrackerStatus as CompanyStatus,
  type CareerTrackerChecklistItem as ChecklistItem,
  type CareerTrackerCompanyItem as CompanyBoardItem,
} from "@/utils/careerTracker";

const SCROLL_IDLE_TIMEOUT_MS = 180;
const LONG_PRESS_TIMEOUT_MS = 320;
const TOUCH_MOVE_CANCEL_THRESHOLD_PX = 10;

type TrackerTab = "todo" | "kanban";

type KanbanCardItem = {
  cardId: string;
  scrapId: string;
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
  { key: "planned", label: "지원 예정", emptyHint: "아직 공고가 없어요." },
  { key: "applying", label: "전형 진행 중", emptyHint: "아직 공고가 없어요." },
  { key: "accepted", label: "합격", emptyHint: "아직 공고가 없어요." },
  { key: "rejected", label: "불합격", emptyHint: "아직 공고가 없어요." },
];

const DEFAULT_TODOS: ChecklistItem[] = [
  {
    id: "todo-default-1",
    text: "오늘 지원할 공고 1개만 먼저 정하기",
    done: false,
  },
  { id: "todo-default-2", text: "이력서 최신 버전 점검하기", done: false },
];

const getStatusLabel = (status: CompanyStatus) =>
  STATUS_META.find((meta) => meta.key === status)?.label ?? "";

export default function CareerTrackerFloating() {
  const [isOpen, setIsOpen] = useState(false);
  const [isWindowScrolling, setIsWindowScrolling] = useState(false);
  const [openStatusMenuCardId, setOpenStatusMenuCardId] = useState<
    string | null
  >(null);
  const [isScrapToastVisible, setIsScrapToastVisible] = useState(false);
  const [isStorageReady, setIsStorageReady] = useState(false);
  const [isStorageAvailable, setIsStorageAvailable] = useState(true);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [todos, setTodos] = useState<ChecklistItem[]>(DEFAULT_TODOS);
  const [companies, setCompanies] = useState<CompanyBoardItem[]>([]);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [touchDraggingCardId, setTouchDraggingCardId] = useState<string | null>(
    null,
  );
  const [dragOverStatus, setDragOverStatus] = useState<CompanyStatus | null>(
    null,
  );
  const [todoInput, setTodoInput] = useState("");
  const [activeTab, setActiveTab] = useState<TrackerTab>("todo");
  const [activeKanbanStatus, setActiveKanbanStatus] =
    useState<CompanyStatus>("planned");
  const todoInputRef = useRef<HTMLInputElement | null>(null);
  const scrollIdleTimerRef = useRef<number | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const touchStartPointRef = useRef<{ x: number; y: number } | null>(null);

  const restoreFromStorage = useCallback(() => {
    try {
      const { todos, companies } = getCareerTrackerStorage();
      setTodos(todos);
      setCompanies(companies);
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
    const handleWindowScroll = () => {
      if (isOpen) {
        return;
      }

      setIsWindowScrolling(true);

      if (scrollIdleTimerRef.current !== null) {
        window.clearTimeout(scrollIdleTimerRef.current);
      }

      scrollIdleTimerRef.current = window.setTimeout(() => {
        setIsWindowScrolling(false);
      }, SCROLL_IDLE_TIMEOUT_MS);
    };

    window.addEventListener("scroll", handleWindowScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleWindowScroll);

      if (scrollIdleTimerRef.current !== null) {
        window.clearTimeout(scrollIdleTimerRef.current);
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setIsWindowScrolling(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleScrapAdded = () => {
      setIsScrapToastVisible(true);
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
  }, []);

  useEffect(() => {
    const handleTrackerUpdated = () => {
      restoreFromStorage();
    };

    window.addEventListener(
      CAREER_TRACKER_UPDATED_EVENT,
      handleTrackerUpdated as EventListener,
    );

    return () => {
      window.removeEventListener(
        CAREER_TRACKER_UPDATED_EVENT,
        handleTrackerUpdated as EventListener,
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
    if (!isOpen || activeTab !== "todo") {
      return;
    }

    window.requestAnimationFrame(() => {
      todoInputRef.current?.focus();
    });
  }, [activeTab, isOpen]);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  useEffect(
    () => () => {
      clearLongPressTimer();
    },
    [clearLongPressTimer],
  );

  useEffect(() => {
    if (isOpen && activeTab === "kanban") {
      return;
    }

    clearLongPressTimer();
    touchStartPointRef.current = null;
    setTouchDraggingCardId(null);
    setDraggingCardId(null);
    setDragOverStatus(null);
  }, [activeTab, clearLongPressTimer, isOpen]);

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
    window.addEventListener("touchstart", handlePointerDown, { passive: true });
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
        }),
      );
    } catch (error) {
      console.error("Failed to persist career tracker storage", error);
      setIsStorageAvailable(false);
      setStorageWarning(
        "시크릿 모드 또는 브라우저 설정에 따라 내용 저장이 제한될 수 있어요. 새로고침 시 데이터가 사라질 수 있습니다.",
      );
    }
  }, [companies, isStorageAvailable, isStorageReady, todos]);

  const handleAddTodo = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedText = todoInput.trim();
    if (!trimmedText) {
      return;
    }

    const isDuplicate = todos.some(
      (todo) => todo.text.trim().toLowerCase() === trimmedText.toLowerCase(),
    );
    if (isDuplicate) {
      setTodoInput("");
      return;
    }

    setTodos((prev) => [
      ...prev,
      { id: createId(), text: trimmedText, done: false },
    ]);
    setTodoInput("");
  };

  const toggleTodo = (todoId: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId ? { ...todo, done: !todo.done } : todo,
      ),
    );
  };

  const removeTodo = (todoId: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== todoId));
  };

  const clearCompletedTodos = () => {
    setTodos((prev) => prev.filter((todo) => !todo.done));
  };

  const updateScrapStatus = (
    companyId: string,
    scrapId: string,
    status: CompanyStatus,
  ) => {
    setCompanies((prev) =>
      prev.map((company) =>
        company.id === companyId
          ? {
              ...company,
              scraps: company.scraps.map((scrap) =>
                scrap.id === scrapId ? { ...scrap, status } : scrap,
              ),
            }
          : company,
      ),
    );
  };

  const handleCardDragStart = (cardId: string) => {
    setDraggingCardId(cardId);
  };

  const handleCardDragEnd = () => {
    setDraggingCardId(null);
    setDragOverStatus(null);
  };

  const handleColumnDrop = (
    status: CompanyStatus,
    options?: { focusDroppedStatus?: boolean },
  ) => {
    if (!draggingCardId) {
      return;
    }

    setCompanies((prev) =>
      prev.map((company) => ({
        ...company,
        scraps: company.scraps.map((scrap) =>
          scrap.id === draggingCardId ? { ...scrap, status } : scrap,
        ),
      })),
    );
    setDraggingCardId(null);
    setDragOverStatus(null);

    if (options?.focusDroppedStatus) {
      setActiveKanbanStatus(status);
    }
  };

  const getStatusFromPoint = useCallback((x: number, y: number) => {
    const hoveredElement = document.elementFromPoint(x, y);
    if (!(hoveredElement instanceof Element)) {
      return null;
    }

    const columnElement = hoveredElement.closest("[data-kanban-status]");
    const statusValue = columnElement?.getAttribute("data-kanban-status");

    return isCareerTrackerStatus(statusValue) ? statusValue : null;
  }, []);

  const startTouchDragging = useCallback(
    (cardId: string, touchX: number, touchY: number) => {
      setOpenStatusMenuCardId(null);
      setTouchDraggingCardId(cardId);
      setDraggingCardId(cardId);

      const hoveredStatus = getStatusFromPoint(touchX, touchY);
      setDragOverStatus(hoveredStatus);
    },
    [getStatusFromPoint],
  );

  const stopTouchDragging = useCallback(
    (touchX?: number, touchY?: number) => {
      if (!touchDraggingCardId) {
        return;
      }

      let nextStatus: CompanyStatus | null = dragOverStatus;
      if (typeof touchX === "number" && typeof touchY === "number") {
        nextStatus = getStatusFromPoint(touchX, touchY) ?? dragOverStatus;
      }

      if (nextStatus) {
        setCompanies((prev) =>
          prev.map((company) => ({
            ...company,
            scraps: company.scraps.map((scrap) =>
              scrap.id === touchDraggingCardId
                ? { ...scrap, status: nextStatus }
                : scrap,
            ),
          })),
        );
      }

      setTouchDraggingCardId(null);
      setDraggingCardId(null);
      setDragOverStatus(null);
    },
    [dragOverStatus, getStatusFromPoint, touchDraggingCardId],
  );

  const handleCardTouchStart = (
    cardId: string,
    event: React.TouchEvent<HTMLDivElement>,
  ) => {
    if (event.touches.length !== 1) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    // Keep tap interactions for buttons/menus inside card.
    if (
      target.closest(`.${styles["status-menu"]}`) ||
      target.closest(`.${styles["kanban-card-delete-button"]}`)
    ) {
      return;
    }

    clearLongPressTimer();
    const touch = event.touches[0];
    touchStartPointRef.current = { x: touch.clientX, y: touch.clientY };

    longPressTimerRef.current = window.setTimeout(() => {
      startTouchDragging(cardId, touch.clientX, touch.clientY);
    }, LONG_PRESS_TIMEOUT_MS);
  };

  const handleCardTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }

    if (!touchDraggingCardId) {
      if (longPressTimerRef.current !== null && touchStartPointRef.current) {
        const movedX = Math.abs(touch.clientX - touchStartPointRef.current.x);
        const movedY = Math.abs(touch.clientY - touchStartPointRef.current.y);

        // Cancel long press when user is scrolling or swiping.
        if (
          movedX > TOUCH_MOVE_CANCEL_THRESHOLD_PX ||
          movedY > TOUCH_MOVE_CANCEL_THRESHOLD_PX
        ) {
          clearLongPressTimer();
          touchStartPointRef.current = null;
        }
      }
      return;
    }

    event.preventDefault();
    const hoveredStatus = getStatusFromPoint(touch.clientX, touch.clientY);
    if (hoveredStatus !== dragOverStatus) {
      setDragOverStatus(hoveredStatus);
    }
  };

  const handleCardTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    clearLongPressTimer();
    touchStartPointRef.current = null;

    if (!touchDraggingCardId) {
      return;
    }

    const touch = event.changedTouches[0];
    if (!touch) {
      stopTouchDragging();
      return;
    }

    stopTouchDragging(touch.clientX, touch.clientY);
  };

  const handleCardTouchCancel = () => {
    clearLongPressTimer();
    touchStartPointRef.current = null;
    stopTouchDragging();
  };

  const removeScrapFromCompany = (companyId: string, scrapId: string) => {
    setCompanies((prev) =>
      prev.flatMap((company) => {
        if (company.id !== companyId) {
          return [company];
        }

        const nextScraps = company.scraps.filter(
          (scrap) => scrap.id !== scrapId,
        );
        if (nextScraps.length === 0) {
          return [];
        }

        return [{ ...company, scraps: nextScraps }];
      }),
    );
  };

  const completedTodoCount = todos.filter((todo) => todo.done).length;
  const pendingTodoCount = todos.filter((todo) => !todo.done).length;
  const sortedTodos = useMemo(
    () => [...todos].sort((a, b) => Number(a.done) - Number(b.done)),
    [todos],
  );
  const totalCompanyCount = companies.length;
  const totalScrapCount = companies.reduce(
    (acc, company) => acc + company.scraps.length,
    0,
  );
  const kanbanCards: KanbanCardItem[] = companies.flatMap<KanbanCardItem>(
    (company) => {
      const pendingTaskCount = company.tasks.filter(
        (task) => !task.done,
      ).length;
      const totalTaskCount = company.tasks.length;

      return company.scraps.map<KanbanCardItem>((scrap) => ({
        cardId: scrap.id,
        scrapId: scrap.id,
        companyId: company.id,
        companyName: company.name,
        status: scrap.status,
        scrapCount: company.scraps.length,
        scrapTitle: scrap.title,
        pendingTaskCount,
        totalTaskCount,
      }));
    },
  );

  const getKanbanCardsByStatus = (status: CompanyStatus) =>
    kanbanCards.filter((card) => card.status === status);

  const handleTrackerToggle = () => {
    setIsScrapToastVisible(false);
    setIsWindowScrolling(false);
    setIsOpen((prev) => !prev);
  };

  return (
    <div
      className={`${styles["tracker-root"]} ${isWindowScrolling && !isOpen ? styles["tracker-root-scrolling"] : ""}`}
    >
      <button
        type="button"
        className={`${styles["panel-backdrop"]} ${isOpen ? styles["backdrop-open"] : styles["backdrop-closed"]}`}
        onClick={() => setIsOpen(false)}
        aria-label="작업실 닫기"
      />
      <aside
        id="career-tracker-panel"
        className={`${styles["tracker-panel"]} ${isOpen ? styles["panel-open"] : styles["panel-closed"]}`}
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
              className={styles["panel-close-button"]}
              onClick={() => setIsOpen(false)}
              aria-label="작업실 닫기"
            >
              ×
            </button>
          </div>
        </div>
        {storageWarning ? (
          <p className={styles["storage-warning"]}>{storageWarning}</p>
        ) : null}

        <div className={styles["panel-tabs"]}>
          <button
            type="button"
            className={`${styles["panel-tab"]} ${activeTab === "todo" ? styles["panel-tab-active"] : ""}`}
            onClick={() => setActiveTab("todo")}
          >
            투두리스트
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
              <div className={styles["todo-toolbar"]}>
                <span className={styles["todo-progress-chip"]}>
                  {pendingTodoCount} / {todos.length}
                </span>
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
                  ref={todoInputRef}
                  type="text"
                  value={todoInput}
                  onChange={(event) => setTodoInput(event.target.value)}
                  placeholder="ex. 오늘의 공고 지원해보기"
                  aria-label="오늘 할 일 입력"
                />
                <button type="submit">일정 등록하기</button>
              </form>
              <ul className={styles["checklist"]}>
                {sortedTodos.map((todo) => (
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
              <div className={styles["kanban-meta-row"]}>
                <div className={styles["kanban-status-row"]}>
                  {STATUS_META.map((status) => (
                    <button
                      key={status.key}
                      type="button"
                      className={`${styles["kanban-status-chip"]} ${activeKanbanStatus === status.key ? styles["kanban-status-chip-active"] : ""} ${draggingCardId && dragOverStatus === status.key ? styles["kanban-status-chip-drop-target"] : ""}`}
                      data-kanban-status={status.key}
                      onClick={() => setActiveKanbanStatus(status.key)}
                      onDragOver={(event) => {
                        if (!draggingCardId) {
                          return;
                        }
                        event.preventDefault();
                        if (dragOverStatus !== status.key) {
                          setDragOverStatus(status.key);
                        }
                      }}
                      onDragEnter={() => {
                        if (!draggingCardId) {
                          return;
                        }
                        setDragOverStatus(status.key);
                      }}
                      onDragLeave={(event) => {
                        if (!draggingCardId) {
                          return;
                        }
                        const nextTarget = event.relatedTarget as Node | null;
                        if (
                          nextTarget &&
                          event.currentTarget.contains(nextTarget)
                        ) {
                          return;
                        }
                        if (dragOverStatus === status.key) {
                          setDragOverStatus(null);
                        }
                      }}
                      onDrop={(event) => {
                        if (!draggingCardId) {
                          return;
                        }
                        event.preventDefault();
                        handleColumnDrop(status.key, {
                          focusDroppedStatus: true,
                        });
                      }}
                      aria-pressed={activeKanbanStatus === status.key}
                    >
                      {status.label} {getKanbanCardsByStatus(status.key).length}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles["kanban-board"]}>
                {STATUS_META.map((status) => {
                  const items = getKanbanCardsByStatus(status.key);

                  return (
                    <article
                      key={status.key}
                      className={`${styles["kanban-column"]} ${dragOverStatus === status.key ? styles["kanban-column-drop-target"] : ""} ${activeKanbanStatus !== status.key ? styles["kanban-column-mobile-hidden"] : ""}`}
                      data-kanban-status={status.key}
                      onDragOver={(event) => {
                        event.preventDefault();
                        if (dragOverStatus !== status.key) {
                          setDragOverStatus(status.key);
                        }
                      }}
                      onDragEnter={() => setDragOverStatus(status.key)}
                      onDragLeave={(event) => {
                        const nextTarget = event.relatedTarget as Node | null;
                        if (
                          nextTarget &&
                          event.currentTarget.contains(nextTarget)
                        ) {
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
                          <p
                            className={`${styles["empty-state"]} ${styles["kanban-empty-card"]}`}
                          >
                            {status.emptyHint}
                          </p>
                        ) : (
                          items.map((card) => (
                            <div
                              key={card.cardId}
                              className={`${styles["kanban-card"]} ${draggingCardId === card.cardId ? styles["kanban-card-dragging"] : ""} ${touchDraggingCardId === card.cardId ? styles["kanban-card-touch-dragging"] : ""} ${openStatusMenuCardId === card.cardId ? styles["kanban-card-menu-open"] : ""}`}
                              draggable
                              onDragStart={() =>
                                handleCardDragStart(card.cardId)
                              }
                              onDragEnd={handleCardDragEnd}
                              onTouchStart={(event) =>
                                handleCardTouchStart(card.cardId, event)
                              }
                              onTouchMove={handleCardTouchMove}
                              onTouchEnd={handleCardTouchEnd}
                              onTouchCancel={handleCardTouchCancel}
                            >
                              <div className={styles["kanban-card-top"]}>
                                <p className={styles["company-focus-button"]}>
                                  {card.companyName}
                                </p>
                                <div className={styles["status-menu"]}>
                                  <button
                                    type="button"
                                    className={`${styles["status-menu-trigger"]} ${openStatusMenuCardId === card.cardId ? styles["status-menu-trigger-open"] : ""}`}
                                    onClick={() =>
                                      setOpenStatusMenuCardId((prev) =>
                                        prev === card.cardId
                                          ? null
                                          : card.cardId,
                                      )
                                    }
                                    aria-haspopup="menu"
                                    aria-expanded={
                                      openStatusMenuCardId === card.cardId
                                    }
                                    aria-label={`${card.companyName} 상태 변경`}
                                  >
                                    <span>{getStatusLabel(card.status)}</span>
                                    <span
                                      className={styles["status-menu-caret"]}
                                      aria-hidden="true"
                                    >
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
                                        const isCurrent =
                                          option.key === card.status;

                                        return (
                                          <button
                                            key={option.key}
                                            type="button"
                                            role="menuitemradio"
                                            aria-checked={isCurrent}
                                            className={`${styles["status-menu-option"]} ${isCurrent ? styles["status-menu-option-active"] : ""}`}
                                            onClick={() => {
                                              updateScrapStatus(
                                                card.companyId,
                                                card.scrapId,
                                                option.key,
                                              );
                                              setOpenStatusMenuCardId(null);
                                            }}
                                          >
                                            <span>{option.label}</span>
                                            {isCurrent ? (
                                              <span
                                                className={
                                                  styles["status-menu-check"]
                                                }
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
                              <p className={styles["kanban-card-scrap-count"]}>
                                스크랩 공고 {card.scrapCount}개
                              </p>
                              {card.scrapTitle ? (
                                <p
                                  className={styles["kanban-card-scrap-title"]}
                                >
                                  공고: {card.scrapTitle}
                                </p>
                              ) : null}
                              <div className={styles["kanban-card-footer"]}>
                                <span>
                                  남은 할 일 {card.pendingTaskCount}/
                                  {card.totalTaskCount}
                                </span>
                                <button
                                  type="button"
                                  className={
                                    styles["kanban-card-delete-button"]
                                  }
                                  onClick={() =>
                                    removeScrapFromCompany(
                                      card.companyId,
                                      card.scrapId,
                                    )
                                  }
                                >
                                  스크랩 삭제
                                </button>
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
        {totalCompanyCount > 0 ? (
          <span className={styles["tracker-count"]}>{totalCompanyCount}</span>
        ) : null}
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
