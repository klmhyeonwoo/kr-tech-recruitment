import React from "react";
import styles from "@/styles/components/user-status-block.module.scss";
import Avatar from "boring-avatars";

interface userStatusBlockProps {
  isLogin: boolean;
  userName?: string;
}

const AVATAR_NAMES = [
  "Maya Angelou",
  "Elizabeth Peratrovich",
  "Alicia Dickerson",
  "Maud Nathan",
  "Susan B",
  "Mother Frances",
];

export default function UserStatusBlock({
  isLogin = false,
  userName,
}: userStatusBlockProps) {
  const avatarName =
    AVATAR_NAMES[Math.floor(Math.random() * AVATAR_NAMES.length)];

  return (
    <div className={styles.user__status__container}>
      <Avatar
        name={avatarName}
        colors={["#0a0310", "#49007e", "#ff005b", "#ff7d10", "#ffb238"]}
        variant="beam"
        size={35}
      />
      {isLogin ? `${userName}님, 반가워요!` : "Please log in"}
    </div>
  );
}
