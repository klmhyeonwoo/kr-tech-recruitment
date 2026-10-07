"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Portal } from "@/components/common/overlay/portal";
import community from "@/api/domain/community";
import CommunityEditor from "@/app/community/_components/community-editor";
import {
  createEmptyCommunityDocument,
  serializeCommunityDocument,
  type CommunityDocument,
} from "@/lib/community/document";
import quitIcon from "@public/icon/quit.svg";
import styles from "@/styles/components/board-modal.module.scss";

interface BoardProps {
  closeModal: () => void;
  refreshData: () => void;
}

const TITLE_MAX_LENGTH = 70;
const CONTENT_MAX_LENGTH = 3000;

export default function BoardPostModal({ refreshData, closeModal }: BoardProps) {
  const [title, setTitle] = useState("");
  const [editorDocument, setEditorDocument] = useState<CommunityDocument>(
    createEmptyCommunityDocument,
  );
  const [characterCount, setCharacterCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const content = serializeCommunityDocument(editorDocument);
  const isDirty = Boolean(title.trim() || characterCount);
  const isFormValid = Boolean(
    title.trim() && characterCount && characterCount <= CONTENT_MAX_LENGTH,
  );

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const handleContentChange = useCallback(
    (nextDocument: CommunityDocument, nextCharacterCount: number) => {
      setEditorDocument(nextDocument);
      setCharacterCount(nextCharacterCount);
    },
    [],
  );

  const handleRequestClose = useCallback(() => {
    if (isSubmitting) return;
    if (isDirty && !window.confirm("작성 중인 내용이 있어요. 정말 닫으시겠어요?")) {
      return;
    }
    closeModal();
  }, [closeModal, isDirty, isSubmitting]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    if (!isFormValid) {
      setShowValidation(true);
      titleRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      const { status } = await community.createBoard({
        title: title.trim(),
        content,
      });

      if (status >= 200 && status < 300) {
        refreshData();
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
  }, [closeModal, content, isFormValid, isSubmitting, refreshData, title]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleRequestClose();
      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        void handleSubmit();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleRequestClose, handleSubmit]);

  return (
    <Portal id="portal" antiScroll={true}>
      <div
        className={styles.editor}
        role="dialog"
        aria-modal="true"
        aria-label="새 커뮤니티 글 작성"
      >
        <header className={styles.editor__toolbar}>
          <button
            type="button"
            className={styles.close__button}
            onClick={handleRequestClose}
            aria-label="작성 화면 닫기"
          >
            <Image src={quitIcon} alt="" width={14} height={14} />
          </button>
          <span className={styles.editor__label}>새 글</span>
          <button
            type="button"
            className={styles.publish__button}
            disabled={!isFormValid || isSubmitting}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting ? "게시 중" : "게시"}
          </button>
        </header>

        <main className={styles.document}>
          <label className={styles.screenreader__only} htmlFor="board-post-title">
            게시글 제목
          </label>
          <input
            ref={titleRef}
            id="board-post-title"
            className={styles.title__input}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="제목 없음"
            maxLength={TITLE_MAX_LENGTH}
            aria-invalid={showValidation && !title.trim()}
          />

          <div className={styles.document__meta}>
            <span>{characterCount}/{CONTENT_MAX_LENGTH}</span>
            <span>⌘ + Enter로 게시</span>
          </div>

          <CommunityEditor
            onChange={handleContentChange}
            onSubmit={() => void handleSubmit()}
          />

          {showValidation && (!title.trim() || !characterCount || characterCount > CONTENT_MAX_LENGTH) && (
            <p className={styles.validation__text} role="alert">
              {!title.trim()
                ? "제목을 입력해주세요."
                : characterCount > CONTENT_MAX_LENGTH
                  ? `내용은 ${CONTENT_MAX_LENGTH.toLocaleString("ko-KR")}자까지 작성할 수 있어요.`
                  : "내용을 입력해주세요."}
            </p>
          )}
        </main>
      </div>
    </Portal>
  );
}
