import { api } from "@/api";
import { Fragment, Suspense } from "react";
import TabSection from "@/components/tab/Section";
import "@/styles/domain/web.scss";
import Header from "@/components/common/header";
import SearchSection from "@/components/search/Section";

async function getCompanyList() {
  try {
    const { data } = await api.get("/companies");
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

async function getStandardRecruitData() {
  try {
    const { data } = await api.get(`/companies/standard-categories`);
    return data;
  } catch (error) {
    return { data: [], error };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { companies } = await getCompanyList();
  const { list } = await getStandardRecruitData();

  return (
    <Fragment>
      <Header />
      <section>
        <article className="content-wrapper">
          <div>
            <Suspense>
              <TabSection data={companies} />
              <SearchSection data={list || []} />
            </Suspense>
            {children}
          </div>
        </article>
      </section>
    </Fragment>
  );
}
