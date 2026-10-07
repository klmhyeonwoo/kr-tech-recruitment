"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { Portal } from "@/components/common/overlay/portal";
import community from "@/api/domain/community";
import {
  createEmptyBlock,
  serializeCommunityBlocks,
  type CommunityBlock,
  type CommunityBlockType,
} from "@/lib/community/document";
import quitIcon from "@public/icon/quit.svg";
import styles from "@/styles/components/board-modal.module.scss";

interface BoardProps {
  closeModal: () => void;
  refreshData: () => void;
}

const TITLE_MAX_LENGTH = 70;
const CONTENT_MAX_LENGTH = 3000;

const BLOCK_ACTIONS: Array<{ type: CommunityBlockType; label: string; hint: string }> = [
  { type: "paragraph", label: "본문", hint: "일반 문단" },
  { type: "heading", label: "소제목", hint: "내용을 나누는 제목" },
  { type: "bullet", label: "글머리", hint: "항목 정리" },
  { type: "quote", label: "인용", hint: "강조하고 싶은 문장" },
];

export default function BoardPostModal({ refreshData, closeModal }: BoardProps) {
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<CommunityBlock[]>([createEmptyBlock()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const blockId = useRef(1);
  const titleRef = useRef<HTMLInputElement>(null);
  const blockRefs = useRef(new Map<string, HTMLTextAreaElement>());
  const content = serializeCommunityBlocks(blocks);
  const contentLength = content.length;
  const isDirty = Boolean(title.trim() || content.trim());
  const isFormValid = Boolean(
    title.trim() && content.trim() && contentLength <= CONTENT_MAX_LENGTH,
  );
  const slashBlockIndex = blocks.findIndex(
    (block) => block.text.trim() === "/",
  );

  const createBlock = useCallback(
    (type: CommunityBlockType = "paragraph", text = ""): CommunityBlock => {
      blockId.current += 1;
      return { id: `block-${blockId.current}`, type, text };
    },
    [],
  );

  const focusBlock = useCallback((id: string, position?: number) => {
    requestAnimationFrame(() => {
      const target = blockRefs.current.get(id);
      if (!target) return;
      target.focus();
      const nextPosition = position ?? target.value.length;
      target.setSelectionRange(nextPosition, nextPosition);
    });
  }, []);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useLayoutEffect(() => {
    blockRefs.current.forEach((textarea) => {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(textarea.scrollHeight, 32)}px`;
    });
  }, [blocks]);

  const updateBlock = (id: string, text: string) => {
    setBlocks((current) =>
      current.map((block) => (block.id === id ? { ...block, text } : block)),
    );
  };

  const selectBlockType = (type: CommunityBlockType) => {
    if (slashBlockIndex < 0) return;
    const block = blocks[slashBlockIndex];
    setBlocks((current) =>
      current.map((item) =>
        item.id === block.id ? { ...item, type, text: "" } : item,
      ),
    );
    focusBlock(block.id, 0);
  };

  const handleBlockKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
    index: number,
  ) => {
    const block = blocks[index];
    const field = event.currentTarget;
    const cursor = field.selectionStart;

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const before = block.text.slice(0, cursor);
      const after = block.text.slice(field.selectionEnd);
      const next = createBlock(block.type, after);

      setBlocks((current) => [
        ...current.slice(0, index),
        { ...block, text: before },
        next,
        ...current.slice(index + 1),
      ]);
      focusBlock(next.id, 0);
      return;
    }

    if (event.key !== "Backspace" || cursor !== 0 || field.selectionEnd !== 0) {
      return;
    }

    if (block.text || index === 0) return;

    event.preventDefault();
    const previous = blocks[index - 1];
    setBlocks((current) => current.filter((item) => item.id !== block.id));
    focusBlock(previous.id);
  };

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
      if (!title.trim()) titleRef.current?.focus();
      else focusBlock(blocks[0].id);
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
  }, [
    blocks,
    closeModal,
    content,
    focusBlock,
    isFormValid,
    isSubmitting,
    refreshData,
    title,
  ]);

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
          <label className={styles.screenreader__only} htmlFor="board-post-modal-title">
            게시글 제목
          </label>
          <input
            ref={titleRef}
            id="board-post-modal-title"
            className={styles.title__input}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="제목 없음"
            maxLength={TITLE_MAX_LENGTH}
            aria-invalid={showValidation && !title.trim()}
          />

          <div className={styles.document__meta}>
            <span>{contentLength}/{CONTENT_MAX_LENGTH}</span>
            <span>⌘ + Enter로 게시</span>
          </div>

          <section className={styles.blocks} aria-label="게시글 내용">
            {blocks.map((block, index) => (
              <div
                key={block.id}
                className={styles.block}
                data-type={block.type}
              >
                {block.type === "bullet" && <span aria-hidden="true">•</span>}
                {block.type === "quote" && <span aria-hidden="true">“</span>}
                <textarea
                  ref={(element) => {
                    if (element) blockRefs.current.set(block.id, element);
                    else blockRefs.current.delete(block.id);
                  }}
                  value={block.text}
                  rows={1}
                  placeholder={
                    index === 0
                      ? "내용을 입력하거나 '/'로 블록을 선택하세요"
                      : "계속 작성하세요"
                  }
                  onChange={(event) => updateBlock(block.id, event.target.value)}
                  onKeyDown={(event) => handleBlockKeyDown(event, index)}
                  aria-label={`${index + 1}번째 ${block.type} 블록`}
                />
              </div>
            ))}
          </section>

          {slashBlockIndex >= 0 && (
            <div className={styles.command__menu} role="menu" aria-label="블록 선택">
              {BLOCK_ACTIONS.map((action) => (
                <button
                  key={action.type}
                  type="button"
                  role="menuitem"
                  onClick={() => selectBlockType(action.type)}
                >
                  <strong>{action.label}</strong>
                  <span>{action.hint}</span>
                </button>
              ))}
            </div>
          )}

          {showValidation && (!title.trim() || !content.trim() || contentLength > CONTENT_MAX_LENGTH) && (
            <p className={styles.validation__text} role="alert">
              {!title.trim()
                ? "제목을 입력해주세요."
                : contentLength > CONTENT_MAX_LENGTH
                  ? `내용은 ${CONTENT_MAX_LENGTH.toLocaleString("ko-KR")}자까지 작성할 수 있어요.`
                  : "내용을 입력해주세요."}
            </p>
          )}
        </main>
      </div>
    </Portal>
  );
}
