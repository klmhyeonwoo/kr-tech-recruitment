import styles from "../../styles/components/loading.module.scss";

function SpinnerLoading() {
  return (
    <div className={styles.loader}>
      <div className={styles.spinner}></div>
    </div>
  );
}

export default SpinnerLoading;
