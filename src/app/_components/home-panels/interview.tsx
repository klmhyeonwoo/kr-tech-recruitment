import data from "@/data/interview-questions.json";
import InterviewQuestionsClient from "@/app/interview-questions/_components/InterviewQuestionsClient";
import styles from "./panels.module.scss";

export default function InterviewPanel() {
  return <section className={styles.panel}>
    <h1>기술 면접 준비</h1>
    <InterviewQuestionsClient data={data} />
    <footer className={styles.source}>
      <a href="https://github.com/maeil-mail/maeil-mail-contents" target="_blank"
        rel="noopener noreferrer">매일메일 공개 질문 자료 ↗</a>
    </footer>
  </section>;
}
