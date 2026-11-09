"use client";
import React, {
  Fragment,
  useRef,
  useEffect,
  useState,
  useTransition,
} from "react";
import icon_arrow from "@public/icon/arrow_gray.svg";
import icon_airplane from "@public/icon/airplane.svg";
import icon_quit from "@public/icon/quit.svg";
import Image from "next/image";
import { scaledPositionName } from "@/utils/common";
import styles from "@/styles/components/input.module.scss";
import { useFilter } from "@/hooks/common/useFilter";
import useClickOutside from "@/hooks/common/useClickOutside";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getDevice } from "kr-corekit";

type SelectType = {
  data: {
    code: string;
    name: string;
  }[];
  placeholder: string;
  isIcon?: boolean;
  /**
   * 값을 부모가 직접 관리하는 모드입니다. (주소의 category 값을 쓰지 않아요)
   * onSelect 에 null 이 오면 선택이 해제된 것입니다.
   */
  value?: string | null;
  onSelect?: (code: string | null) => void;
  /** 선택 해제(X) 버튼 노출 여부. 기본값은 true */
  clearable?: boolean;
  label?: string;
};

function Select({
  data,
  placeholder,
  isIcon = true,
  value,
  onSelect,
  clearable = true,
  label = "직무 카테고리",
  ...props
}: SelectType) {
  const selectRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const controlled = onSelect !== undefined;
  const category = controlled ? (value ?? null) : searchParams.get("category");
  const [isMobile, setIsMobile] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const { isMobile } = getDevice();
    setIsMobile(isMobile);
  }, []);

  useClickOutside({
    ref: selectRef as React.RefObject<HTMLElement>,
    callback: () => {
      setIsOpenFilter(false);
    },
  });
  const {
    isOpenFilter,
    setIsOpenFilter,
    setSelectedGlobalFilter,
    removeSelectedFilter,
  } = useFilter();

  const displayName = (code: string) => {
    const found = data.find((item) => item.code === code);
    return scaledPositionName(found?.name ?? code);
  };

  const handleOpenSelect = () => {
    if (!isMobile) {
      setIsOpenFilter(true);
    }
  };

  const clear = () => {
    if (controlled) onSelect(null);
    else removeSelectedFilter();
  };

  const handleCleanUpFilter = (event: React.MouseEvent<HTMLImageElement>) => {
    event.stopPropagation();
    clear();
  };

  const choose = (item: string) => {
    if (controlled) {
      onSelect(item);
      return;
    }
    setSelectedGlobalFilter(item);
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", item);
    const nextQuery = params.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    const currentQuery = searchParams.toString();
    const currentUrl = currentQuery ? `${pathname}?${currentQuery}` : pathname;
    if (nextUrl === currentUrl) return;

    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  };

  const handleCloseSelect = (item: string) => {
    setIsOpenFilter(false);
    triggerRef.current?.focus();
    choose(item);
  };

  // Native select change handler
  const handleNativeSelectChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const next = event.target.value;
    if (next) choose(next);
    else clear();
  };

  // data가 없을 경우에는 노출시키지 않음
  if (data.length === 0) {
    return;
  }

  // Use native select on mobile
  if (isMobile) {
    return (
      <div className={styles.select__box} data-mobile="true">
        {isIcon && (
          <Image src={icon_airplane} alt={placeholder} width={16} height={16} />
        )}
        <select
          aria-label={label}
          value={category || ""}
          onChange={handleNativeSelectChange}
          className={styles.native__select}
        >
          {clearable && <option value="">{placeholder}</option>}
          {data.map((item) => (
            <option key={item.code} value={item.code}>
              {scaledPositionName(item.name)}
            </option>
          ))}
        </select>
        {category && clearable && (
          <Image
            src={icon_quit}
            alt="선택 해제"
            width={12}
            height={12}
            onClick={handleCleanUpFilter}
            className={styles.clear__button}
          />
        )}
      </div>
    );
  }

  // Use custom select on desktop
  return (
    <Fragment>
      <div
        className={styles.select__box}
        ref={triggerRef}
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpenFilter}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleOpenSelect();
          }
        }}
        onClick={handleOpenSelect}
        data-selected={category ? true : false}
        data-is-open-data-list={isOpenFilter}
        {...props}
      >
        {isIcon ? (
          <Image src={icon_airplane} alt={placeholder} width={16} height={16} />
        ) : null}
        {category ? (
          <span>{displayName(category)}</span>
        ) : (
          <span>{placeholder}</span>
        )}
        {category && clearable ? (
          <Image
            src={icon_quit}
            alt="선택 해제"
            width={12}
            height={12}
            onClick={handleCleanUpFilter}
          />
        ) : (
          <Image
            className={styles.arrow__icon}
            src={icon_arrow}
            alt=""
            width={18}
            height={18}
          />
        )}
      </div>
      {isOpenFilter && (
        <div
          className={styles.search__container}
          role="listbox"
          aria-label={label}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsOpenFilter(false);
              triggerRef.current?.focus();
            } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
              event.preventDefault();
              const options = Array.from(selectRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? []);
              const current = options.indexOf(document.activeElement as HTMLElement);
              const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 :
                event.key === "ArrowDown" ? (current + 1) % options.length : (current <= 0 ? options.length - 1 : current - 1);
              options[next]?.focus();
            }
          }}
          ref={selectRef}
          data-lenis-prevent
        >
          {data.map((item) => (
            <div
              key={item.code}
              className={styles.item__wrapper}
              role="option"
              aria-selected={category === item.code}
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleCloseSelect(item.code);
                }
              }}
              data-item={item}
              onClick={() => handleCloseSelect(item.code)}
            >
              <span> {scaledPositionName(item.name)} </span>
            </div>
          ))}
        </div>
      )}
    </Fragment>
  );
}

export default Select;
