import ListItem from "@/components/commnuity/list-item";
import Title from "@/components/commnuity/title";
import UserStatusBlock from "@/components/commnuity/user-status-block";
import React from "react";

export default function Page() {
  return (
    <div>
      <Title
        title="취준 · 취업 커뮤니티"
        description="커뮤니티에서 여러분들의 고민과 노하우들을 자유롭게 이야기해보세요"
      />
      <UserStatusBlock isLogin={true} userName="John Doe" />
      <ListItem
        title="취업 준비 중인데, 이력서 첨삭 부탁드려요!"
        writer="Jane Doe"
        date="2023-10-01"
        commentCount={5}
        likeCount={10}
      />
    </div>
  );
}
