import styles from "@/styles/components/tab.module.scss";

type TabType = {
  label: string;
  value: string;
  index: number;
  active: number;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

function Tab({ label, value, index, active, ...props }: TabType) {
  return (
    <button
      type="button"
      className={styles.tab}
      data-value={value}
      role="tab"
      aria-selected={active === index}
      {...props}
    >
      <span>{label}</span>
    </button>
  );
}

export default Tab;
