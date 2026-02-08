"use client";
import React, { useLayoutEffect, useRef, useState } from "react";
import styles from "@/styles/components/board-modal.module.scss";
import { Portal } from "../portal";
import star_icon from "../../../../public/icon/star.gif";
import Image from "next/image";
import Input from "@/components/search/Input";
import Button from "../button";
import Textarea from "@/components/search/Textarea";
import community from "@/api/domain/community";
import useClickOutside from "@/hooks/common/useClickOutside";

interface BoardProps {
  closeModal: () => void;
  refreshData: () => void;
}

export default function Board({ refreshData, closeModal }: BoardProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [content]);

  useClickOutside({
    ref: containerRef as React.RefObject<HTMLElement>,
    callback: () => {
      closeModal();
    },
  });

  const handleClose = () => {
    closeModal();
    handleCleanUp();
  };

  const handleSubmit = async () => {
    const { status, data } = await community.createBoard({ title, content });
    console.log(status, data);
    refreshData();
    handleClose();
  };

  const handleCleanUp = () => {
    setTitle("");
    setContent("");
  };

  return (
    <Portal id="portal" antiScroll={true}>
      <div className={styles.modal__container}>
        <div className={styles.modal__wrapper} ref={containerRef}>
          <div className={styles.modal__header}>
            <Image src={star_icon} alt="별 아이콘" width={50} height={50} />
            <span>
              여러분들의 이야기를 조금 더 상세하게 적으면 더 많은 댓글이 달려요!
            </span>
          </div>
          <div className={styles.modal__title}>
            <span> 어떤 제목으로 게시글을 올려볼까요? </span>
            <Input
              placeholder="제목을 입력해주세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              isIcon={false}
              maxLength={69}
            />
          </div>
          <div className={styles.modal__content}>
            <span> 게시글에 대해 조금 더 이야기해주세요 </span>
            <Textarea
              placeholder="내용을 입력해주세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              ref={textareaRef}
              maxLength={2999}
            />
          </div>
          <div className={styles.button__container}>
            <Button onClick={handleClose}> 뒤로 돌아가기 </Button>
            <Button onClick={handleSubmit}> 게시글 작성하기 </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
