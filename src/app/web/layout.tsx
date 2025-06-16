import { api } from "@/api";
import { Fragment, Suspense } from "react";
import TabSection from "@/components/tab/Section";
import "@/styles/domain/web.scss";
import Header from "@/components/common/header";

async function getCompanyList() {
  try {
    const { data } = await api.get("/companies");
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { companies } = await getCompanyList();

  return (
    <Fragment>
      <Header />
      <section>
        <article className="content-wrapper">
          <div>
            <Suspense>
              <TabSection data={companies} />
            </Suspense>
            {children}
          </div>
        </article>
      </section>
    </Fragment>
  );
}
