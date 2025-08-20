import React, { ChangeEvent, forwardRef } from "react";
import styles from "@/styles/components/input.module.scss";

type TextareaType = {
  placeholder?: string;
  value: string;
  isIcon?: boolean;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaType>(
  (
    {
      value,
      onChange,
      placeholder = "내용을 입력해주세요",
      ...props
    }: TextareaType,
    ref
  ) => {
    return (
      <div className={styles.textarea__box}>
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
