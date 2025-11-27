"use client";
import Image from "next/image";
import Link from "next/link";
import React, { Fragment } from "react";
import icon_arrow from "../../../public/icon/arrow_black.svg";
import styles from "./anchor.module.scss";

interface AnchorProps {
  href: string;
  text: string;
  external?: boolean;
}

export default function Anchor({ href, text, external = false }: AnchorProps) {
  return (
    <Fragment>
      <Link
        href={href}
        className={styles.anchor__link}
        onClick={(event) => {
          if (external) {
            event.preventDefault();
            window.open(href);
          }
        }}
      >
        <span>{text}</span>
        <Image
          src={icon_arrow}
          width={14}
          height={14}
          alt="더 많은 공고 보러가기"
        />
      </Link>
    </Fragment>
  );
}
