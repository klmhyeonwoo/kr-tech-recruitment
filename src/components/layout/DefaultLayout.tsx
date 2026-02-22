import Header from "@/components/common/navigation/header";
import React, { Fragment } from "react";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Fragment>
      <Header />
      <section>
        <article className="content-wrapper">
          <div> {children} </div>
        </article>
      </section>
    </Fragment>
  );
}
