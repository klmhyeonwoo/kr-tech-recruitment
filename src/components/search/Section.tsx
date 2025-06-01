"use client";
import styles from "@/styles/components/input.module.scss";
import Select from "./Select";
import Input from "./Input";
import { ChangeEvent } from "react";
import { useAtom } from "jotai";
import { SEARCH_KEYWORD_STORE } from "../../store";

type SectionType = {
  data: string[];
};

function SearchSection({ data }: SectionType) {
  const [value, setValue] = useAtom(SEARCH_KEYWORD_STORE);
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <div className={styles.input__section}>
      <Input
        placeholder="주요 키워드로 공고를 검색해보세요"
        value={value}
        onChange={handleChange}
      />
      <Select
        data={data}
        placeholder={`해당 기업이 제공하는 카테고리 (${data.length})`}
      />
    </div>
  );
}

export default SearchSection;
