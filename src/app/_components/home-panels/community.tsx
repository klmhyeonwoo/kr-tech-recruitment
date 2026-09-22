import List from "@/app/community/_components/list";
import styles from "./panels.module.scss";

export default function CommunityPanel() {
  return <section className={styles.panel}><h1>커뮤니티</h1><List embedded /></section>;
}
