import { api } from "@/api";
import { Suspense } from "react";
import TabSection from "@/components/tab/Section";
import "@/styles/domain/web.scss";
import HomeLogo from "@/components/common/home-logo";

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
  );
}
