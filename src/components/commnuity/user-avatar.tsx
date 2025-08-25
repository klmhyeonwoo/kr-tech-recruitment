"use client";
import React, { memo } from "react";
import Avatar from "boring-avatars";

const AVATAR_NAMES = [
  "Maya Angelou",
  "Elizabeth Peratrovich",
  "Alicia Dickerson",
  "Maud Nathan",
  "Susan B",
  "Mother Frances",
];

interface AvatarProps {
  size: number;
}

const UserAvatar = ({ size = 35 }: AvatarProps) => {
  const avatarName =
    AVATAR_NAMES[Math.floor(Math.random() * AVATAR_NAMES.length)];
  return (
    <Avatar
      name={avatarName}
      colors={["#0a0310", "#49007e", "#ff005b", "#ff7d10", "#ffb238"]}
      variant="beam"
      size={size}
    />
  );
};

export default memo(UserAvatar);
