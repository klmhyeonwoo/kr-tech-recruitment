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
import star_icon from "@public/icon/star.gif";
import quit_icon from "@public/icon/quit.svg";
import Image from "next/image";
import Input from "@/components/search/Input";
import Button from "@/components/common/button";
import Textarea from "@/components/search/Textarea";
import community from "@/api/domain/community";

interface BoardProps {
  closeModal: () => void;
  refreshData: () => void;
}

const TITLE_MAX_LENGTH = 70;
const CONTENT_MAX_LENGTH = 3000;

export default function BoardPostModal({
  refreshData,
  closeModal,
}: BoardProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();
  const isDirty = !!(trimmedTitle || trimmedContent);
  const isFormValid = !!(trimmedTitle && trimmedContent);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [content]);

  const handleCleanUp = useCallback(() => {
    setTitle("");
    setContent("");
    setShowValidation(false);
  }, []);

  const handleRequestClose = useCallback(() => {
    if (isSubmitting) {
      return;
    }

    if (isDirty) {
      const isConfirmed = window.confirm(
        "작성 중인 내용이 있어요. 정말 닫으시겠어요?",
      );

      if (!isConfirmed) {
        return;
      }
    }

    handleCleanUp();
    closeModal();
  }, [closeModal, handleCleanUp, isDirty, isSubmitting]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleRequestClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [handleRequestClose]);

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    if (!isFormValid) {
      setShowValidation(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const { status } = await community.createBoard({
        title: trimmedTitle,
        content: trimmedContent,
      });

      if (status >= 200 && status < 300) {
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
  };

  const handleOverlayMouseDown: React.MouseEventHandler<HTMLDivElement> = (
    event,
  ) => {
    if (event.target === event.currentTarget) {
      handleRequestClose();
    }
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
        <div className={styles.modal__wrapper}>
          <div className={styles.modal__header}>
            <div className={styles.header__info}>
              <Image src={star_icon} alt="별 아이콘" width={36} height={36} />
              <span id="board-post-modal-title">커뮤니티 글 작성하기</span>
            </div>
            <button
              type="button"
              className={styles.close__button}
              onClick={handleRequestClose}
              aria-label="작성 모달 닫기"
            >
              <Image src={quit_icon} alt="" width={12} height={12} />
            </button>
          </div>
          <p className={styles.modal__description}>
            커뮤니티에 여러분들의 생각들을 자유롭게 나눠주세요 ;-)
          </p>
          <div className={styles.modal__title}>
            <div className={styles.field__header}>
              <span>제목</span>
              <span className={styles.count}>
                {title.length}/{TITLE_MAX_LENGTH}
              </span>
            </div>
            <Input
              placeholder="제목을 입력해주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              isIcon={false}
              maxLength={TITLE_MAX_LENGTH}
              autoFocus
            />
            {showValidation && !trimmedTitle && (
              <p className={styles.validation__text}>제목을 입력해주세요.</p>
            )}
          </div>
          <div className={styles.modal__content}>
            <div className={styles.field__header}>
              <span>내용</span>
              <span className={styles.count}>
                {content.length}/{CONTENT_MAX_LENGTH}
              </span>
            </div>
            <Textarea
              placeholder="내용을 입력해주세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              ref={textareaRef}
              maxLength={CONTENT_MAX_LENGTH}
            />
            {showValidation && !trimmedContent && (
              <p className={styles.validation__text}>내용을 입력해주세요.</p>
            )}
          </div>
          <div className={styles.button__container}>
            <Button onClick={handleRequestClose} disabled={isSubmitting}>
              뒤로 돌아가기
            </Button>
            <Button
              onClick={handleSubmit}
              loader={isSubmitting}
              disabled={!isFormValid}
            >
              게시글 작성하기
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
