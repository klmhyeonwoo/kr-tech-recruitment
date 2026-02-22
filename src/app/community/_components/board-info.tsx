import React, { Fragment } from "react";
import styles from "@/styles/components/board-info.module.scss";
import Image from "next/image";
import ellipsis_icon from "@public/icon/commnuity/ellipsis.svg";
import heart from "@public/icon/commnuity/heart.svg";

interface BoardInfoProps extends React.HTMLAttributes<HTMLDivElement> {
  commentCount: number;
  likeCount: number;
}

export default function BoardInfo({
  commentCount,
  likeCount,
  ...props
}: BoardInfoProps) {
  const info = [
    {
      icon: ellipsis_icon,
      count: commentCount,
      className: styles.util__wrapper,
    },
    {
      icon: heart,
      count: likeCount,
      className: styles.util__wrapper,
    },
  ];

  return (
    <Fragment>
      <div className={styles.util__container}>
        {info.map(({ icon, count, className }, index) => (
          <div key={index} className={className} {...props}>
            <Image src={icon} alt={`${icon} icon`} width={23} height={23} />
            <span>{count}</span>
          </div>
        ))}
      </div>
    </Fragment>
  );
}
