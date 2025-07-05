import styles from "@/styles/components/loading.module.scss";
import Image from "next/image";
import icon_eyes from "../../../public/icon/eyes.gif";

export default function EyesLoading() {
  return (
    <div className={styles.container}>
      <Image
        src={icon_eyes}
        width={40}
        height={40}
        alt="데이터를 로딩중이에요"
        priority={true}
      />
    </div>
  );
}
