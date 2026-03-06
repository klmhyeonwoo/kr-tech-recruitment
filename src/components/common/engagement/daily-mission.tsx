"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/components/daily-mission.module.scss";

type MissionId = "recruit" | "community" | "question";

type MissionItem = {
  id: MissionId;
  title: string;
  description: string;
  actionLabel: string;
  type: "scroll" | "route";
  target: string;
};

const STORAGE_PREFIX = "nklcb__daily-mission";

const missions: MissionItem[] = [
  {
    id: "recruit",
    title: "오늘 공고 훑어보기",
    description: "새롭게 등록된 공고 섹션으로 이동해 최신 채용을 확인해보세요.",
    actionLabel: "공고 보러가기",
    type: "scroll",
    target: "ranking-announce",
  },
  {
    id: "community",
    title: "커뮤니티 게시글 읽기",
    description:
      "최근 커뮤니티 게시글 섹션으로 이동해 다른 취준생들의 고민을 확인해보세요.",
    actionLabel: "커뮤니티 보기",
    type: "scroll",
    target: "community",
  },
  {
    id: "question",
    title: "이번 주 질문 참여하기",
    description: "이번 주 질문 페이지로 이동해 5초 답변을 남겨보세요.",
    actionLabel: "질문에 답변하기",
    type: "route",
    target: "/question",
  },
];

const createInitialProgress = () => ({
  recruit: false,
  community: false,
  question: false,
});

const getTodayKey = () => {
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
  }).format(new Date());

  return `${STORAGE_PREFIX}:${today}`;
};

export default function DailyMission() {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [progress, setProgress] = useState(createInitialProgress);
  const [storageKey, setStorageKey] = useState("");

  useEffect(() => {
    const key = getTodayKey();
    setStorageKey(key);

    const savedData = window.localStorage.getItem(key);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setProgress({
          recruit: Boolean(parsed?.recruit),
          community: Boolean(parsed?.community),
          question: Boolean(parsed?.question),
        });
      } catch (error) {
        console.error("Failed to parse daily mission data:", error);
      }
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || !storageKey) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [isHydrated, progress, storageKey]);

  const completedCount = useMemo(() => {
    return Object.values(progress).filter(Boolean).length;
  }, [progress]);

  const missionRate = useMemo(
    () => Math.round((completedCount / missions.length) * 100),
    [completedCount],
  );

  const handleCompleteMission = (id: MissionId) => {
    setProgress((prev) => ({
      ...prev,
      [id]: true,
    }));
  };

  const handleMissionAction = (mission: MissionItem) => {
    handleCompleteMission(mission.id);

    if (mission.type === "route") {
      router.push(mission.target);
      return;
    }

    const targetElement = document.getElementById(mission.target);
    if (!targetElement) {
      return;
    }

    targetElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section className={styles.container} aria-labelledby="daily-mission-title">
      <div className={styles.header}>
        <div>
          <span className={styles.badge}>오늘의 탐색 미션</span>
          <h2 id="daily-mission-title">
            루틴으로 나의 회사를 빠르게 찾아보세요
          </h2>
          <p>
            미션을 완료하면 하루 동안 진행률이 저장돼요. 매일 새로운 루틴으로
            채용/커뮤니티를 빠르게 확인할 수 있어요.
          </p>
        </div>
        <span className={styles.status}>
          {completedCount}/{missions.length} 완료
        </span>
      </div>

      <div
        className={styles.progressBar}
        role="progressbar"
        aria-valuenow={missionRate}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={styles.progress} style={{ width: `${missionRate}%` }} />
      </div>

      <div className={styles.list}>
        {missions.map((mission) => {
          const isDone = progress[mission.id];

          return (
            <article
              key={mission.id}
              className={styles.item}
              data-completed={isDone}
            >
              <div className={styles.itemHeader}>
                <h3>{mission.title}</h3>
                {isDone && <span className={styles.done}>완료</span>}
              </div>
              <p>{mission.description}</p>
              <button
                type="button"
                onClick={() => handleMissionAction(mission)}
                className={styles.action}
                aria-label={`${mission.title} ${mission.actionLabel}`}
              >
                {mission.actionLabel}
              </button>
            </article>
          );
        })}
      </div>

      {completedCount === missions.length && (
        <div className={styles.complete}>
          오늘 미션을 모두 완료했어요, 고생했어요!
        </div>
      )}
    </section>
  );
}
