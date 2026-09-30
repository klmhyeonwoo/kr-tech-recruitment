import Chip from "@/components/common/chip";
import Input from "@/components/search/Input";
import styles from "@/styles/components/popup.module.scss";
import { useContext } from "react";
import { SubsecriptionContext } from "..";

function Progress({
  email,
  handleEmailChange,
  handleAddStandardCategories,
  standardCategory = [],
}: {
  email: string;
  standardCategory: {
    code: string;
    name: string;
  }[];
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddStandardCategories: ({
    item,
  }: {
    item: { code: string; name: string };
  }) => void;
}) {
  const { selectedSubscriptionCategories } = useContext(SubsecriptionContext);

  return (
    <div className={styles.progress__container}>
      <div className={styles.progress__wrapper}>
        <span className={styles.progress__label}> 사용자 이메일 </span>
        <Input
          placeholder="이메일을 입력해주세요"
          value={email}
          onChange={handleEmailChange}
          isIcon={false}
        />
      </div>
      <div className={styles.progress__wrapper}>
        <span className={styles.progress__label}>구독 직무 카테고리</span>
        <div className={styles.progress__chip__container}>
          {standardCategory?.map((item: { code: string; name: string }) => (
            <Chip
              key={item.code}
              value={item.code}
              label={item.name}
              isChecked={selectedSubscriptionCategories?.includes(item.code)}
              onClick={() => handleAddStandardCategories({ item })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Progress;
