import { useLanguage } from "./Language";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { uid, summary, balance, validateTask, downloadReport } from "./helpers";
import { usePlanner, categories, statusNames } from "./context";
import Stat from "./Stat";
import TaskForm from "./TaskForm";
import WordCard from "./WordCard";

export default function Daily() {
  const { t, number, formatDate, language } = useLanguage();
  const { data, dispatch, date, setDate, notify } = usePlanner();
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [allDates, setAllDates] = useState(false);
  const dayTasks = data.tasks.filter((t) => t.date === date);
  const stats = summary(dayTasks);
  const visible = data.tasks
    .filter(
      (t) =>
        (allDates || t.date === date) &&
        t.title
          .toLocaleLowerCase(language)
          .includes(query.toLocaleLowerCase(language)) &&
        (status === "all" || t.status === status) &&
        (category === "all" || t.category === category),
    )
    .sort(
      (a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start),
    );
  function changeStatus(task, next) {
    if (
      task.status === "done" &&
      next !== "done" &&
      balance(data) < task.points
    )
      return notify(
        "These points were spent on a reward. You need enough available points to undo completion.",
      );
    dispatch({ type: "status", id: task.id, status: next });
  }
  function remove(task) {
    if (task.status === "done" && balance(data) < task.points)
      return notify(
        "You need enough points in your balance to delete this completed activity.",
      );
    if (window.confirm(t("deleteConfirm", { title: task.title })))
      dispatch({ type: "delete", id: task.id });
  }
  function copyYesterday() {
    const previous = new Date(`${date}T12:00:00`);
    previous.setDate(previous.getDate() - 1);
    const key = `${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, "0")}-${String(previous.getDate()).padStart(2, "0")}`;
    const tasks = data.tasks
      .filter((t) => t.date === key)
      .map((t) => ({ ...t, id: uid(), date, status: "pending" }));
    if (!tasks.length)
      return notify("No activities were recorded for the previous day.");
    if (tasks.some((t) => validateTask(t, dayTasks)))
      return notify(
        "Cannot copy: some activities overlap this day's schedule.",
      );
    dispatch({ type: "copy", tasks });
    notify("Previous day's schedule copied.");
  }
  async function enableNotifications() {
    if (!("Notification" in window))
      return notify(
        "This browser does not support system notifications. In-app reminders are active.",
      );
    try {
      const permission = await Notification.requestPermission();
      notify(
        permission === "granted"
          ? "Browser notifications enabled. Keep the app open."
          : "In-app reminders are still active.",
      );
    } catch {
      notify(
        "Browser notifications are unavailable here. In-app reminders are active.",
      );
    }
  }
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">{t("SMALL STEPS. DEEP ROOTS.")}</span>
          <h1>{t("Let your day grow.")}</h1>
          <p>
            {t(
              "Make time for what matters. Every small action is a chance to grow.",
            )}
          </p>
          <button className="gold" onClick={() => setEditing({})}>
            {" "}
            {t("＋ Add activity")}{" "}
          </button>
        </div>
        <div className="forest-art" aria-hidden="true">
          <div className="sun" />
          <div className="hill h1" />
          <div className="hill h2" />
          <span className="tree t1">♠</span>
          <span className="tree t2">♠</span>
          <span className="tree t3">♠</span>
          <div className="art-caption">
            {t("A fresh chance to grow, every day")}
          </div>
        </div>
      </section>
      <section className="stats-grid">
        <Stat
          label={t("Activities today")}
          value={number(stats.total)}
          icon="◷"
        />
        <Stat label={t("Completed")} value={number(stats.done)} icon="✓" />
        <Stat
          label={t("Plan completion")}
          value={stats.percent === null ? "—" : number(stats.percent) + t("%")}
          icon="↗"
        />
        <Stat
          label={t("Available points")}
          value={number(balance(data))}
          icon="✦"
          gold
        />
      </section>
      <div className="daily-layout">
        <section className="panel schedule">
          <div className="section-heading">
            <div>
              <span className="eyebrow dark">{t("TIME FOR WHAT MATTERS")}</span>
              <h2>{t("Daily schedule")}</h2>
            </div>
            <label className="date-picker">
              {" "}
              {t("Date")}{" "}
              <input
                aria-label={t("Schedule date")}
                type="date"
                required
                value={date}
                onChange={(e) => {
                  if (e.target.value) setDate(e.target.value);
                }}
              />
            </label>
          </div>
          <div className="day-tools">
            <strong>{formatDate(date)}</strong>
            <Link to="/day-view" className="outline day-view-link">
              ◷ {t("24-hour view")}
            </Link>
            <button className="text-button" onClick={copyYesterday}>
              {" "}
              {t("↶ Copy previous day")}{" "}
            </button>
            <span className="muted">{t("00:00 — 24:00")}</span>
          </div>
          <div className="filters">
            <input
              aria-label={t("Search activities")}
              placeholder={t("⌕ Search activities…")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              aria-label={t("Filter by status")}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">{t("All statuses")}</option>
              {Object.entries(statusNames).map(([k, v]) => (
                <option key={k} value={k}>
                  {t(v)}
                </option>
              ))}
            </select>
            <select
              aria-label={t("Filter by category")}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">{t("All categories")}</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {t(c)}
                </option>
              ))}
            </select>
          </div>
          <label className="check-label">
            <input
              type="checkbox"
              checked={allDates}
              onChange={(e) => setAllDates(e.target.checked)}
            />{" "}
            {t("Search and show all days")}{" "}
          </label>
          <div className="task-list">
            {visible.length ? (
              visible.map((task) => (
                <article className={"task " + task.status} key={task.id}>
                  <div className="task-time" dir="ltr">
                    {task.start}
                    <span>│</span>
                    {task.end}
                  </div>
                  <div className="task-body">
                    <div className="task-title">
                      <h3>{task.title}</h3>
                      <span className="category">{t(task.category)}</span>
                    </div>
                    <p>
                      {allDates && formatDate(task.date) + " · "}
                      {t(statusNames[task.status])}{" "}
                      <span>
                        · {number(task.points)} {t("Points")}
                      </span>
                      {task.reminder !== "off" && (
                        <span> {t("· ◷ Reminder")}</span>
                      )}
                    </p>
                    <div className="task-actions">
                      <button
                        className={task.status === "done" ? "selected" : ""}
                        onClick={() =>
                          changeStatus(
                            task,
                            task.status === "done" ? "pending" : "done",
                          )
                        }
                      >
                        {" "}
                        {t("✓ Done")}{" "}
                      </button>
                      <button
                        className={
                          task.status === "missed" ? "selected danger" : ""
                        }
                        onClick={() =>
                          changeStatus(
                            task,
                            task.status === "missed" ? "pending" : "missed",
                          )
                        }
                      >
                        {" "}
                        {t("× Not done")}{" "}
                      </button>
                      <button onClick={() => setEditing(task)}>
                        {t("Edit")}
                      </button>
                      <button
                        aria-label={t("Delete") + " " + task.title}
                        onClick={() => remove(task)}
                      >
                        {" "}
                        {t("Delete")}{" "}
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty">
                <span>❧</span>
                <h3>
                  {dayTasks.length || query || allDates
                    ? t("No activities match these filters.")
                    : t("A fresh day. A fresh start.")}
                </h3>
                <p>{t("Add your first activity to shape your day.")}</p>
                <button className="primary" onClick={() => setEditing({})}>
                  {" "}
                  {t("＋ New activity")}{" "}
                </button>
              </div>
            )}
          </div>
          <div className="report-bar">
            <div>
              <strong>{t("Daily report")}</strong>
              <small>
                {number(stats.done)} {t("completed ·")} {number(stats.missed)}{" "}
                {t("not completed ·")} {number(stats.pending)}{" "}
                {t("Pending")}{" "}
              </small>
            </div>
            <button
              className="outline"
              onClick={() => downloadReport(data, date, language)}
            >
              {" "}
              {t("↓ Download CSV report")}{" "}
            </button>
          </div>
        </section>
        <aside className="right-column">
          <WordCard key={date} />
          <section className="panel reminder-card">
            <span className="card-symbol">◷</span>
            <h2>{t("On time. At ease.")}</h2>
            <p>
              {" "}
              {t(
                "Choose a reminder when adding an activity. Keep the app open; reminders may not work while your device sleeps.",
              )}{" "}
            </p>
            <button className="outline" onClick={enableNotifications}>
              {" "}
              {t("Enable browser notifications")}{" "}
            </button>
          </section>
          <div className="quote">
            {" "}
            {t("“You do not need to see the whole path;")} <br />{" "}
            {t("just take the next step.”")}
            <span>❧</span>
          </div>
        </aside>
      </div>
      {editing && <TaskForm task={editing} close={() => setEditing(null)} />}
    </>
  );
}
