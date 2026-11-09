import React, { Fragment } from "react";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Fragment>
      <section>
        <article className="content-wrapper">
          <div> {children} </div>
        </article>
      </section>
    </Fragment>
  );
}
