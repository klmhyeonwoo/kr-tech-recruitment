import data from "@/data/dev-activities.json";
import Directory from "./directory";

const categories = [
  { id: "all", label: "전체" }, { id: "club", label: "동아리" },
  { id: "education", label: "교육·부트캠프" }, { id: "meetup", label: "모임·밋업" },
  { id: "conference", label: "행사·컨퍼런스" },
];
export default function ActivitiesPanel() {
  return <Directory title="개발자 대외활동"
    items={data.activities.map((item) => ({ ...item, description: item.description ?? "" }))}
    categories={categories}
    searchLabel="동아리, 교육, 모임 검색" />;
}
