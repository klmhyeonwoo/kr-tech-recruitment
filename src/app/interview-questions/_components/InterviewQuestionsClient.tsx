"use client";

import { useState, useCallback } from "react";
import styles from "../page.module.scss";
import useTechInterviewAnswer from "@/hooks/api/useGetTechInterviewAnswer";

type Question = {
  id: string;
  title: string;
};

type Category = {
  id: string;
  label: string;
  description: string;
  questions: Question[];
};

type TypeData = {
  label: string;
  categories: Category[];
};

type InterviewData = {
  frontend: TypeData;
  backend: TypeData;
};

const STORAGE_KEY = "nklcb__interview_checked";

function loadChecked(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveChecked(state: Record<string, boolean>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function processInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>',
    );
}

function markdownToHtml(md: string): string {
  const codeBlocks: string[] = [];
  const text = md.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const i = codeBlocks.length;
    codeBlocks.push(
      `<pre class="${styles.codeBlock}"><code class="${lang ? `language-${lang}` : ""}">${escapeHtml(code.trim())}</code></pre>`,
    );
    return `\x00CB${i}\x00`;
  });

  const lines = text.split("\n");
  const result: string[] = [];
  let inUl = false;
  let inOl = false;

  const closeList = () => {
    if (inUl) {
      result.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      result.push("</ol>");
      inOl = false;
    }
  };

  for (const line of lines) {
    if (line.startsWith("### ")) {
      closeList();
      result.push(`<h3>${processInline(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith("## ")) {
      closeList();
      result.push(`<h2>${processInline(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith("# ")) {
      closeList();
      result.push(`<h1>${processInline(line.slice(2))}</h1>`);
      continue;
    }

    const ulMatch = line.match(/^[-*] (.+)/);
    if (ulMatch) {
      if (inOl) {
        result.push("</ol>");
        inOl = false;
      }
      if (!inUl) {
        result.push("<ul>");
        inUl = true;
      }
      result.push(`<li>${processInline(ulMatch[1])}</li>`);
      continue;
    }

    const olMatch = line.match(/^\d+\. (.+)/);
    if (olMatch) {
      if (inUl) {
        result.push("</ul>");
        inUl = false;
      }
      if (!inOl) {
        result.push("<ol>");
        inOl = true;
      }
      result.push(`<li>${processInline(olMatch[1])}</li>`);
      continue;
    }

    if (line.trim() === "") {
      closeList();
      result.push("");
      continue;
    }

    if (line.includes("\x00CB")) {
      closeList();
      result.push(line);
      continue;
    }

    if (line.trimStart().startsWith("<")) {
      closeList();
      result.push(line);
      continue;
    }

    result.push(`<p>${processInline(line)}</p>`);
  }

  closeList();

  let html = result.join("\n");
  codeBlocks.forEach((block, i) => {
    html = html.replace(`\x00CB${i}\x00`, block);
  });
  return html;
}

function AnswerPanel({ questionId }: { questionId: string }) {
  const { data, isLoading, isError } = useTechInterviewAnswer({
    id: questionId,
  });

  if (isLoading) {
    return (
      <div className={styles.answerLoading}>
        <span className={styles.loadingDot} />
        <span className={styles.loadingDot} />
        <span className={styles.loadingDot} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className={styles.answerError}>
        답변을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
      </div>
    );
  }

  return (
    <div
      className={styles.answerContent}
      dangerouslySetInnerHTML={{ __html: markdownToHtml(data) }}
    />
  );
}

function QuestionItem({
  question,
  checked,
  onToggleCheck,
}: {
  question: Question;
  checked: boolean;
  onToggleCheck: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`${styles.questionItem} ${checked ? styles.questionItemChecked : ""}`}
    >
      <div className={styles.questionRow}>
        <button
          className={`${styles.checkbox} ${checked ? styles.checkboxChecked : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleCheck(question.id);
          }}
          aria-label={checked ? "완료 취소" : "완료 표시"}
          type="button"
        >
          {checked && (
            <svg viewBox="0 0 12 12" fill="none" aria-hidden>
              <path
                d="M2 6l3 3 5-5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        <button
          className={styles.questionTitle}
          onClick={() => setExpanded((p) => !p)}
          type="button"
        >
          <span>{question.title}</span>
          <svg
            className={`${styles.chevron} ${expanded ? styles.chevronOpen : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <polyline
              points="6 9 12 15 18 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {expanded && (
        <div className={styles.answerWrapper}>
          <AnswerPanel questionId={question.id} />
        </div>
      )}
    </div>
  );
}

function CategorySection({
  category,
  checkedState,
  onToggleCheck,
}: {
  category: Category;
  checkedState: Record<string, boolean>;
  onToggleCheck: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const checkedCount = category.questions.filter(
    (q) => checkedState[q.id],
  ).length;
  const total = category.questions.length;

  return (
    <div className={styles.categoryCard}>
      <button
        className={styles.categoryHeader}
        onClick={() => setOpen((p) => !p)}
        type="button"
        aria-expanded={open}
      >
        <div className={styles.categoryMeta}>
          <span className={styles.categoryLabel}>{category.label}</span>
          <span className={styles.categoryProgress}>
            {checkedCount}/{total}
          </span>
        </div>
        <div className={styles.categoryRight}>
          <div className={styles.categoryMiniBar}>
            <div
              className={styles.categoryMiniFill}
              style={{
                width: `${total > 0 ? (checkedCount / total) * 100 : 0}%`,
              }}
            />
          </div>
          <svg
            className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <polyline
              points="6 9 12 15 18 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      {open && (
        <div className={styles.questionList}>
          <p className={styles.categoryDescription}>{category.description}</p>
          {category.questions.map((q) => (
            <QuestionItem
              key={q.id}
              question={q}
              checked={!!checkedState[q.id]}
              onToggleCheck={onToggleCheck}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function InterviewQuestionsClient({
  data,
}: {
  data: InterviewData;
}) {
  const [activeTab, setActiveTab] = useState<"frontend" | "backend">(
    "frontend",
  );
  const [checkedState, setCheckedState] = useState<Record<string, boolean>>(
    () => loadChecked(),
  );

  const handleToggleCheck = useCallback((id: string) => {
    setCheckedState((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      saveChecked(next);
      return next;
    });
  }, []);

  const currentData = data[activeTab];

  const totalQuestions = currentData.categories.reduce(
    (sum, c) => sum + c.questions.length,
    0,
  );
  const checkedCount = currentData.categories.reduce(
    (sum, c) => sum + c.questions.filter((q) => checkedState[q.id]).length,
    0,
  );
  const progressPercent =
    totalQuestions > 0 ? Math.round((checkedCount / totalQuestions) * 100) : 0;

  return (
    <div className={styles.clientRoot}>
      <div className={styles.tabRow}>
        <button
          className={`${styles.tabBtn} ${activeTab === "frontend" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("frontend")}
          type="button"
        >
          프론트엔드
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "backend" ? styles.tabBtnActive : ""}`}
          onClick={() => setActiveTab("backend")}
          type="button"
        >
          백엔드
        </button>
      </div>

      <div className={styles.progressCard}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>
            {currentData.label} 진행도
          </span>
          <span className={styles.progressCount}>
            <strong>{checkedCount}</strong> / {totalQuestions}개 완료
          </span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className={styles.progressPercent}>{progressPercent}%</p>
      </div>

      <div className={styles.categoriesList}>
        {currentData.categories.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            checkedState={checkedState}
            onToggleCheck={handleToggleCheck}
          />
        ))}
      </div>
    </div>
  );
}
