"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import styles from "../page.module.scss";
import type { TrendsData, Ranking } from "../page";

function fmt(value: number | null): string {
  if (value === null || value === undefined) return "-";
  return value.toLocaleString("ko-KR");
}

type TooltipProps = {
  active?: boolean;
  payload?: { payload: Ranking }[];
};

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipName}>{d.name}</p>
      <p>점수 <strong>{d.score.toFixed(1)}</strong></p>
      {d.metrics.githubStars !== null && (
        <p>GitHub ⭐&nbsp;<strong>{fmt(d.metrics.githubStars)}</strong></p>
      )}
      {d.metrics.npmDownloads !== null && (
        <p>npm 다운로드&nbsp;<strong>{fmt(d.metrics.npmDownloads)}</strong></p>
      )}
      {d.metrics.soQuestions !== null && (
        <p>Stack Overflow 질문&nbsp;<strong>{fmt(d.metrics.soQuestions)}</strong></p>
      )}
      {d.rankChange !== null && d.rankChange !== undefined && (
        <p className={d.rankChange > 0 ? styles.up : d.rankChange < 0 ? styles.down : styles.flat}>
          {d.rankChange > 0 ? `▲ ${d.rankChange} 상승` : d.rankChange < 0 ? `▼ ${Math.abs(d.rankChange)} 하락` : "— 변동 없음"}
        </p>
      )}
    </div>
  );
}

const BADGE_CLASS: Record<number, string> = {
  0: styles.rankBadge1,
  1: styles.rankBadge2,
  2: styles.rankBadge3,
};

export default function TrendChart({ data }: { data: TrendsData }) {
  const domainKeys = Object.keys(data.domains);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeKey = domainKeys[activeIndex];
  const currentDomain = data.domains[activeKey];
  const chartData = [...currentDomain.rankings]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const collectedDate = new Date(data.collectedAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={styles.chartSection}>
      <div className={styles.chartCard}>
        {/* 카테고리 선택 */}
        <select
          className={styles.categorySelect}
          value={activeIndex}
          onChange={(e) => setActiveIndex(Number(e.target.value))}
          aria-label="카테고리 선택"
        >
          {domainKeys.map((key, i) => (
            <option key={key} value={i}>
              {data.domains[key].label}
            </option>
          ))}
        </select>

        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
            >
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={96}
                tick={{ fill: "#374151", fontSize: 12.5 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
              />
              <Bar dataKey="score" radius={[0, 6, 6, 0]} maxBarSize={18}>
                {chartData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i < 3 ? "#111827" : "#d1d5db"}
                    fillOpacity={i < 3 ? 1 - i * 0.15 : 1 - (i - 3) * 0.06}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 랭킹 리스트 */}
      <div className={styles.rankList}>
        {chartData.map((item, i) => {
          const rankChange = item.rankChange;
          return (
            <div key={item.name} className={styles.rankItem}>
              <span className={`${styles.rankBadge} ${BADGE_CLASS[i] ?? ""}`}>
                {i + 1}
              </span>
              <span className={styles.rankName}>{item.name}</span>
              {rankChange !== null && rankChange !== undefined && (
                <span className={`${styles.rankChange} ${rankChange > 0 ? styles.up : rankChange < 0 ? styles.down : styles.flat}`}>
                  {rankChange > 0 ? `▲${rankChange}` : rankChange < 0 ? `▼${Math.abs(rankChange)}` : "—"}
                </span>
              )}
              <span className={styles.rankScore}>{item.score.toFixed(1)}</span>
            </div>
          );
        })}
      </div>

      {/* 수집일 */}
      <div className={styles.footer}>
        <p className={styles.collectedAt}>수집일: {collectedDate}</p>
      </div>
    </div>
  );
}
