"use client";

import { useState, type ReactNode } from "react";
import styles from "./panels.module.scss";

export type DirectoryItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  detail?: string;
  links: { label: string; url: string }[];
};

export default function Directory({ title, items, categories, searchLabel, source }: {
  title: string;
  items: DirectoryItem[];
  categories: { id: string; label: string }[];
  searchLabel: string;
  source?: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const needle = query.trim().toLocaleLowerCase("ko-KR");
  const filtered = items.filter((item) =>
    (category === "all" || item.category === category) &&
    [item.name, item.description, item.detail ?? ""].some((value) => value.toLocaleLowerCase("ko-KR").includes(needle)));

  return <section className={styles.panel}>
    <h1>{title}</h1>
    <div className={styles.filters} role="group" aria-label={`${title} 분류`}>
      {categories.map((item) => <button key={item.id} type="button"
        aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.label}</button>)}
    </div>
    <input className={styles.search} type="search" value={query} onChange={(e) => setQuery(e.target.value)}
      aria-label={searchLabel} placeholder={searchLabel} />
    <p className={styles.count} role="status">{filtered.length}개</p>
    {filtered.length ? <ul className={styles.list}>
      {filtered.map((item) => <li key={item.id}>
        <div className={styles.rowHeading}><h2>{item.name}</h2>
          <span>{categories.find((c) => c.id === item.category)?.label}</span></div>
        {item.description && <p>{item.description}</p>}
        {item.detail && <p>{item.detail}</p>}
        <div className={styles.links}>{item.links.map((link) =>
          <a key={link.url + link.label} href={link.url} target="_blank" rel="noopener noreferrer">
            {link.label || "자세히 보기"} <span aria-hidden="true">↗</span>
          </a>)}</div>
      </li>)}
    </ul> : <div className={styles.empty} role="status">
      <p>조건에 맞는 결과가 없어요.</p>
      <button type="button" onClick={() => { setQuery(""); setCategory("all"); }}>검색 초기화</button>
    </div>}
    {source && <footer className={styles.source}>{source}</footer>}
  </section>;
}
