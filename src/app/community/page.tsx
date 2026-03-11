import React, { Fragment } from "react";
import Title from "./_components/title";
import List from "./_components/list";

export default async function Page() {
  return (
    <Fragment>
      <Title
        title="커뮤니티"
        description="여러분들의 고민과 노하우들을 자유롭게 이야기해보세요"
      />
      <List />
    </Fragment>
  );
}
