import LetterFade from "@/components/common/animation/letter-fade";
import styles from "@/styles/components/popup.module.scss";

function Complete() {
  return (
    <div className={styles.complete__container}>
      <LetterFade
        as="span"
        text="구독이 성공적으로 완료되었어요."
        options={{ delay: 0.1 }}
      />
      <LetterFade
        as="span"
        text="조금만 기다려주시면,"
        options={{ delay: 0.3 }}
      />
      <LetterFade
        as="span"
        text="곧 다양한 소식으로 찾아올게요."
        options={{ delay: 0.5 }}
      />
    </div>
  );
}

export default Complete;
