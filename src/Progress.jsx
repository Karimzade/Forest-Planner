import { useLanguage } from "./Language";
import React, { useState, useMemo } from "react";
import { earned, dailySeries } from "./helpers";
import { usePlanner } from "./context";
import Stat from "./Stat";
import Chart from "./Chart";

export default function Progress() {
  const { t, number, formatDate } = useLanguage();
  const { data } = usePlanner();
  const [mode, setMode] = useState("words");
  const rows = useMemo(() => dailySeries(data), [data]);
  return (
    <>
      <div className="page-heading">
        <span className="eyebrow dark">
          {t("FROM YOUR FIRST STEP TO TODAY")}
        </span>
        <h1>{t("Your growth journey")}</h1>
        <p>{t("Every point is part of your journey. Be kind to yourself.")}</p>
      </div>
      <section className="stats-grid">
        <Stat
          label={t("Activities completed")}
          value={number(data.tasks.filter((t) => t.status === "done").length)}
          icon="✓"
        />
        <Stat
          label={t("Total words")}
          value={number(Object.values(data.words).reduce((s, n) => s + n, 0))}
          icon="Aa"
        />
        <Stat
          label={t("Total points earned")}
          value={number(earned(data))}
          icon="✦"
          gold
        />
        <Stat
          label={t("Rewards claimed")}
          value={number(data.history.length)}
          icon="♧"
        />
      </section>
      <section className="panel">
        <h2>{t("Plan completion over time")}</h2>
        <p className="muted">
          {" "}
          {t(
            "Completed activities as a percentage of each day's plan. Days without a plan have no percentage and break the line.",
          )}{" "}
        </p>
        <Chart
          rows={rows}
          field="percent"
          label={t("Daily completion percentage")}
          percent
        />
      </section>
      <section className="panel spaced">
        <div className="section-heading">
          <h2>{t("Your vocabulary journey")}</h2>
          <select
            aria-label={t("Vocabulary chart type")}
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="words">{t("Words per day")}</option>
            <option value="cumulative">{t("Cumulative total")}</option>
          </select>
        </div>
        <Chart
          rows={rows}
          field={mode}
          label={mode === "words" ? t("Daily words") : t("Total words")}
        />
      </section>
      <section className="panel spaced">
        <h2>{t("Your days at a glance")}</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t("Date")}</th>
                <th>{t("Completed / total")}</th>
                <th>{t("Completion")}</th>
                <th>{t("Words today")}</th>
                <th>{t("Total words")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.date}>
                  <td>{formatDate(r.date)}</td>
                  <td>
                    {number(r.done)} / {number(r.total)}
                  </td>
                  <td>
                    {r.percent === null
                      ? t("No plan")
                      : number(r.percent) + t("%")}
                  </td>
                  <td>{number(r.words)}</td>
                  <td>{number(r.cumulative)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && (
            <p className="muted">{t("No data recorded yet.")}</p>
          )}
        </div>
      </section>
    </>
  );
}
