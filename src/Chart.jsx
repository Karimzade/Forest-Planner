import React from "react";
import { useLanguage } from "./Language";

export default function Chart({ rows, field, label, percent = false }) {
  const { t, number } = useLanguage();
  const max = percent ? 100 : Math.max(1, ...rows.map((r) => r[field] ?? 0));
  const x = (i) =>
    45 + (rows.length === 1 ? 340 : (i * 680) / (rows.length - 1));
  const y = (value) => 180 - (value / max) * 145;
  return rows.length ? (
    <div className="chart">
      <svg viewBox="0 0 770 230" role="img" aria-label={label}>
        <title>{label}</title>
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line
              x1="45"
              x2="725"
              y1={y(max * t)}
              y2={y(max * t)}
              stroke="#e3e9df"
            />
            <text
              x="32"
              y={y(max * t) + 5}
              textAnchor="end"
              fontSize="12"
              fill="#6c7f72"
            >
              {number(Math.round(max * t))}
            </text>
          </g>
        ))}
        {rows.map((r, i) =>
          r[field] === null ? null : (
            <g key={r.date}>
              {i > 0 && rows[i - 1][field] !== null && (
                <line
                  x1={x(i - 1)}
                  y1={y(rows[i - 1][field])}
                  x2={x(i)}
                  y2={y(r[field])}
                  stroke="#34745a"
                  strokeWidth="3"
                />
              )}
              <circle cx={x(i)} cy={y(r[field])} r="4" fill="#bd9b49">
                <title>
                  {r.date}: {number(r[field])}
                </title>
              </circle>
            </g>
          ),
        )}
        <text x="45" y="217" fontSize="12" fill="#6c7f72">
          {rows[0].date}
        </text>
        <text x="725" y="217" textAnchor="end" fontSize="12" fill="#6c7f72">
          {rows.at(-1).date}
        </text>
      </svg>
    </div>
  ) : (
    <div className="empty compact">
      {" "}
      {t("Add your first activity or word count to start your chart.")}{" "}
    </div>
  );
}
