import styles from "@/styles/components/chip.module.scss";

type ChipType = {
  value: string | number;
  label: string;
  isChecked?: boolean;
  onClick?: () => void;
};

function Chip({ value, label, isChecked, onClick }: ChipType) {
  return (
    <div
      className={styles.chip__container}
      data-value={value}
      data-checked={isChecked}
      onClick={onClick}
    >
      {label}
    </div>
  );
}

export default Chip;
