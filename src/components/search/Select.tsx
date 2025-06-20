"use client";
import React, { Fragment, useRef } from "react";
import icon_arrow from "../../../public/icon/arrow_gray.svg";
import icon_airplane from "../../../public/icon/airplane.svg";
import icon_quit from "../../../public/icon/quit.svg";
import Image from "next/image";
import { scaledPositionName } from "@/utils/common";
import styles from "@/styles/components/input.module.scss";
import { useFilter } from "@/hooks/useFilter";
import useClickOutside from "@/hooks/useClickOutside";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type SelectType = {
  data: {
    code: string;
    name: string;
  }[];
  placeholder: string;
  isIcon?: boolean;
};

function Select({ data, placeholder, isIcon = true, ...props }: SelectType) {
  const selectRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const category = searchParams.get("category");

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

  const handleOpenSelect = () => {
    setIsOpenFilter(true);
  };

  const handleCleanUpFilter = (event: React.MouseEvent<HTMLImageElement>) => {
    event.stopPropagation();
    removeSelectedFilter();
  };

  const handleCloseSelect = (item: string) => {
    setIsOpenFilter(false);
    setSelectedGlobalFilter(item);
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", item);
    router.replace(`${pathname}/?${params.toString()}`);
  };

  // data가 없을 경우에는 노출시키지 않음
  if (data.length === 0) {
    return;
  }

  return (
    <Fragment>
      <div
        className={styles.select__box}
        onClick={handleOpenSelect}
        data-selected={category ? true : false}
        data-is-open-data-list={isOpenFilter}
        {...props}
      >
        {isIcon ? (
          <Image src={icon_airplane} alt={placeholder} width={16} height={16} />
        ) : null}
        {category ? (
          <span>{scaledPositionName(category)}</span>
        ) : (
          <span>{placeholder}</span>
        )}
        {category ? (
          <Image
            src={icon_quit}
            alt={placeholder}
            width={12}
            height={12}
            onClick={handleCleanUpFilter}
          />
        ) : (
          <Image
            className={styles.arrow__icon}
            src={icon_arrow}
            alt={placeholder}
            width={18}
            height={18}
          />
        )}
      </div>
      {isOpenFilter && (
        <div className={styles.search__container} ref={selectRef}>
          {data.map((item) => (
            <div
              key={item.code}
              className={styles.item__wrapper}
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
