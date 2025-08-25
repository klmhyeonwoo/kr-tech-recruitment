import Title from "@/components/commnuity/title";
import UserStatusBlock from "@/components/commnuity/user-status-block";
import React, { Fragment } from "react";
import List from "@/components/commnuity/list";

export default async function Page() {
  return (
    <Fragment>
      <Title
        title="취준 · 취업 커뮤니티"
        description="커뮤니티에서 여러분들의 고민과 노하우들을 자유롭게 이야기해보세요"
      />
      <UserStatusBlock />
      <List />
    </Fragment>
  );
}
