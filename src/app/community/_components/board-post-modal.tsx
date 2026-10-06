"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import styles from "@/styles/components/board-modal.module.scss";
import { Portal } from "@/components/common/overlay/portal";
import quitIcon from "@public/icon/quit.svg";
import Image from "next/image";
import community from "@/api/domain/community";

interface BoardProps {
  closeModal: () => void;
  refreshData: () => void;
}

type WritingTemplate = {
  id: "question" | "career" | "review";
  label: string;
  titleHint: string;
  content: string;
};

const TITLE_MAX_LENGTH = 70;
const CONTENT_MAX_LENGTH = 3000;

const WRITING_TEMPLATES: WritingTemplate[] = [
  {
    id: "question",
    label: "기술 질문",
    titleHint: "어떤 부분에서 막혔나요?",
    content: "지금 막힌 부분:\n\n시도해 본 방법:\n\n도움이 필요한 지점:",
  },
  {
    id: "career",
    label: "커리어 고민",
    titleHint: "어떤 선택을 고민하고 있나요?",
    content: "현재 상황:\n\n고민 중인 선택지:\n\n듣고 싶은 경험:",
  },
  {
    id: "review",
    label: "프로젝트 회고",
    titleHint: "프로젝트에서 무엇을 배웠나요?",
    content: "만든 것:\n\n배운 점:\n\n다음에 바꾸고 싶은 점:",
  },
];

export default function BoardPostModal({
  refreshData,
  closeModal,
}: BoardProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();
  const isDirty = !!(trimmedTitle || trimmedContent);
  const isFormValid = !!(trimmedTitle && trimmedContent);
  const activeTemplate = WRITING_TEMPLATES.find(
    (template) => template.id === selectedTemplate,
  );

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 184)}px`;
  }, [content]);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const handleCleanUp = useCallback(() => {
    setTitle("");
    setContent("");
    setSelectedTemplate(null);
    setShowValidation(false);
  }, []);

  const handleRequestClose = useCallback(() => {
    if (isSubmitting) return;

    if (isDirty) {
      const isConfirmed = window.confirm(
        "작성 중인 내용이 있어요. 정말 닫으시겠어요?",
      );
      if (!isConfirmed) return;
    }

    handleCleanUp();
    closeModal();
  }, [closeModal, handleCleanUp, isDirty, isSubmitting]);

  const handleTemplateSelect = (template: WritingTemplate) => {
    if (content.trim()) {
      const isConfirmed = window.confirm(
        "현재 내용이 양식으로 바뀝니다. 계속할까요?",
      );
      if (!isConfirmed) return;
    }

    setContent(template.content);
    setSelectedTemplate(template.id);
    setShowValidation(false);
    textareaRef.current?.focus();
  };

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    if (!isFormValid) {
      setShowValidation(true);
      if (!trimmedTitle) titleRef.current?.focus();
      else textareaRef.current?.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      const { status } = await community.createBoard({
        title: trimmedTitle,
        content: trimmedContent,
      });

      if (200 <= status && status < 300) {
        refreshData();
        handleCleanUp();
        closeModal();
        return;
      }

      alert("게시글 작성에 실패했어요. 잠시 후 다시 시도해주세요.");
    } catch (error) {
      console.error("Failed to create board:", error);
      alert("게시글 작성 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    closeModal,
    handleCleanUp,
    isFormValid,
    isSubmitting,
    refreshData,
    trimmedContent,
    trimmedTitle,
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleRequestClose();
        return;
      }
      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        void handleSubmit();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleRequestClose, handleSubmit]);

  const handleOverlayMouseDown: React.MouseEventHandler<HTMLDivElement> = (
    event,
  ) => {
    if (event.target === event.currentTarget) handleRequestClose();
  };

  return (
    <Portal id="portal" antiScroll={true}>
      <div
        className={styles.modal__container}
        role="dialog"
        aria-modal="true"
        aria-labelledby="board-post-modal-title"
        onMouseDown={handleOverlayMouseDown}
      >
        <form
          className={styles.modal__wrapper}
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <div className={styles.modal__header}>
            <div className={styles.header__info}>
              <span id="board-post-modal-title">글쓰기</span>
              {isDirty && <em>작성 중</em>}
            </div>
            <button
              type="button"
              className={styles.close__button}
              onClick={handleRequestClose}
              aria-label="작성 창 닫기"
            >
              <Image src={quitIcon} alt="" width={14} height={14} />
            </button>
          </div>

          <p className={styles.modal__description}>
            질문, 고민, 배운 것을 편하게 남겨보세요.
          </p>

          <fieldset className={styles.template__section}>
            <legend>어떤 글을 쓰시나요?</legend>
            <div className={styles.template__list}>
              {WRITING_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  className={styles.template__button}
                  data-selected={selectedTemplate === template.id}
                  onClick={() => handleTemplateSelect(template)}
                >
                  {template.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className={styles.field}>
            <div className={styles.field__header}>
              <label htmlFor="board-post-title">제목</label>
              <span className={styles.count}>
                {title.length}/{TITLE_MAX_LENGTH}
              </span>
            </div>
            <input
              ref={titleRef}
              id="board-post-title"
              className={styles.text__input}
              placeholder={activeTemplate?.titleHint ?? "제목을 입력해주세요"}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={TITLE_MAX_LENGTH}
              aria-invalid={showValidation && !trimmedTitle}
              aria-describedby={
                showValidation && !trimmedTitle
                  ? "board-post-title-error"
                  : undefined
              }
            />
            {showValidation && !trimmedTitle && (
              <p id="board-post-title-error" className={styles.validation__text}>
                제목을 입력해주세요.
              </p>
            )}
          </div>

          <div className={styles.field}>
            <div className={styles.field__header}>
              <label htmlFor="board-post-content">내용</label>
              <span className={styles.count}>
                {content.length}/{CONTENT_MAX_LENGTH}
              </span>
            </div>
            <textarea
              ref={textareaRef}
              id="board-post-content"
              className={styles.textarea}
              placeholder="상황과 궁금한 점을 구체적으로 적어주세요"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={CONTENT_MAX_LENGTH}
              aria-invalid={showValidation && !trimmedContent}
              aria-describedby={
                showValidation && !trimmedContent
                  ? "board-post-content-error"
                  : "board-post-helper"
              }
            />
            {showValidation && !trimmedContent ? (
              <p id="board-post-content-error" className={styles.validation__text}>
                내용을 입력해주세요.
              </p>
            ) : (
              <p id="board-post-helper" className={styles.helper__text}>
                개인정보와 회사의 비공개 정보는 빼고 작성해주세요.
              </p>
            )}
          </div>

          <div className={styles.button__container}>
            <button
              type="button"
              className={styles.cancel__button}
              onClick={handleRequestClose}
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className={styles.submit__button}
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? "게시하는 중" : "게시하기"}
            </button>
          </div>
        </form>
      </div>
    </Portal>
  );
}
