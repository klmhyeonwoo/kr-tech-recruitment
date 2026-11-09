import React, { ChangeEvent } from "react";
import styles from "@/styles/components/input.module.scss";
import icon_search from "@public/icon/search.svg";
import Image from "next/image";

type InputType = {
  placeholder?: string;
  value: string;
  isIcon?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
} & React.InputHTMLAttributes<HTMLInputElement>;

function Input({
  value,
  onChange,
  placeholder = "텍스트를 입력해주세요",
  isIcon = true,
  ...props
}: InputType) {
  return (
    <div className={styles.input__box}>
      {isIcon ? (
        <Image
          src={icon_search}
          alt="채용 공고를 키워드로 검색해보세요"
          width={16}
          height={16}
        />
      ) : null}
      {/* 커서가 있을 때는 기본 placeholder 가 "…" 없이 잘려서, 직접 그려 줍니다. */}
      <div className={styles.input__field}>
        <input
          type="text"
          value={value}
          onChange={onChange}
          aria-label={props["aria-label"] ?? placeholder}
          {...props}
        />
        {!value && placeholder ? (
          <div className={styles.input__placeholder} aria-hidden="true">
            <span>{placeholder}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Input;
