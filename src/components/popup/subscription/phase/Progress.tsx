import type { ChangeEvent } from "react";
import Input from "@/components/search/Input";
import styles from "@/styles/components/popup.module.scss";

type Category = { code: string; name: string };

export default function Progress({
  email,
  handleEmailChange,
  onToggleCategory,
  standardCategory,
  selectedCategories,
}: {
  email: string;
  standardCategory: Category[];
  selectedCategories: string[];
  handleEmailChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onToggleCategory: (code: string) => void;
}) {
  return (
    <div className={styles.progress__container}>
      <div className={styles.progress__wrapper}>
        <label className={styles.progress__label} htmlFor="subscription-email">이메일</label>
        <Input
          id="subscription-email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          onChange={handleEmailChange}
          isIcon={false}
        />
      </div>
      <div className={styles.progress__wrapper}>
        <span className={styles.progress__label}>관심 직무</span>
        <div className={styles.progress__chip__container} role="group" aria-label="관심 직무">
          {standardCategory.map((item) => (
            <button
              key={item.code}
              type="button"
              className={styles.categoryChip}
              aria-pressed={selectedCategories.includes(item.code)}
              onClick={() => onToggleCategory(item.code)}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
