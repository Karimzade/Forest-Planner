import { useLanguage, LanguagePicker } from "./Language";
import React, { useState, useEffect, useCallback, useReducer } from "react";
import {
  NavLink,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { today, emptyData, readData, reducer, downloadBackup } from "./helpers";
import { PlannerContext } from "./context";
import Daily from "./Daily";
import DayOverview from "./DayOverview";
import Progress from "./Progress";
import Rewards from "./Rewards";
const reminded = new Set();
let loadError = "";
let savedData;
try {
  savedData = readData();
} catch {
  savedData = emptyData;
  loadError =
    "خواندن داده‌های قبلی ممکن نشد. برای جلوگیری از بازنویسی، ذخیرهٔ خودکار غیرفعال است.";
}

export default function App() {
  const location = useLocation();
  const { t, number, formatDate, language } = useLanguage();
  const [storageError, setStorageError] = useState(loadError);
  const [data, dispatch] = useReducer(reducer, null, () => {
    try {
      return readData();
    } catch {
      return savedData;
    }
  });
  const [date, setDate] = useState(today);
  const [notice, setNotice] = useState("");
  const [reminders, setReminders] = useState([]);

  // Effects synchronize React with browser storage and the clock.
  useEffect(() => {
    if (loadError) return;
    try {
      localStorage.setItem("forest-planner-v1", JSON.stringify(data));
      setStorageError("");
    } catch {
      setStorageError(
        "Browser storage is unavailable. Download a backup to keep your data.",
      );
    }
  }, [data]);
  useEffect(() => {
    const check = () => {
      const now = new Date();
      data.tasks
        .filter((t) => t.status === "pending" && t.reminder !== "off")
        .forEach((task) => {
          const due =
            new Date(`${task.date}T${task.start}:00`).getTime() -
            Number(task.reminder) * 60000;
          const key = `forest-reminded-${task.id}-${task.date}-${task.start}-${task.reminder}`;
          if (
            now.getTime() >= due &&
            now.getTime() - due < 60000 &&
            !reminded.has(key)
          ) {
            reminded.add(key);
            setReminders((old) => [
              ...old,
              { title: task.title, start: task.start, reminder: task.reminder },
            ]);
            if (
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              try {
                new Notification(t("Forest reminder"), {
                  body: task.title + " | " + task.start,
                });
              } catch {
                /* In-app alert stays available. */
              }
            }
          }
        });
    };
    check();
    const timer = setInterval(check, 10000);
    return () => clearInterval(timer);
  }, [data.tasks, language]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timer);
  }, [notice]);
  // useCallback keeps the shared message function stable.
  const notify = useCallback((message) => setNotice(message), []);
  const value = { data, dispatch, date, setDate, notify };
  const nav = [
    ["/", "◷", t("My day")],
    ["/day-view", "▦", t("24-hour view")],
    ["/progress", "↗", t("Progress")],
    ["/rewards", "♧", t("Points & rewards")],
  ];
  return (
    <PlannerContext.Provider value={value}>
      <div className="app-shell">
        <aside className="sidebar">
          <NavLink className="brand" to="/">
            <span className="brand-icon">❧</span>
            <span>
              {" "}
              {t("Forest")}
              <small>{t("A little growth, every day")}</small>
            </span>
          </NavLink>
          <div className="nav-caption">{t("YOUR PERSONAL SPACE")}</div>
          <nav>
            {nav.map(([key, icon, title]) => (
              <NavLink
                key={key}
                end={key === "/"}
                className={({ isActive }) =>
                  isActive
                    ? "nav-item active"
                    : "nav-item"
                }
                to={key}
              >
                <span>{icon}</span>
                {title}
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-note">
            <span>✦</span>
            <p>
              {" "}
              {t("Growth begins")} <br /> {t("with small steps.")}{" "}
            </p>
            <small>{t("Make time for yourself today.")}</small>
          </div>
          <button className="backup" onClick={() => downloadBackup(data)}>
            {" "}
            {t("↓ Download data backup")}{" "}
          </button>
          <small className="local-note">
            {" "}
            {t("Your data stays in this browser.")}{" "}
          </small>
        </aside>
        <main>
          <header className="topbar">
            <LanguagePicker />
            <span>{t("Your personal daily planner")}</span>
            <span className="today-label">{formatDate(today())}</span>
          </header>
          {storageError && <div className="alert">{t(storageError)}</div>}
          {notice && (
            <div className="toast" role="status">
              {t(notice)}
            </div>
          )}
          {reminders.length > 0 && (
            <div className="reminder" role="alert">
              <strong>{t("◷ Time for your next step")}</strong>
              {reminders.map((text, i) => (
                <p key={i}>
                  {text.title} —{" "}
                  {text.reminder === "0"
                    ? t("Time to start now")
                    : t("minutesUntil", { n: number(text.reminder) })}{" "}
                  ({text.start})
                </p>
              ))}
              <button onClick={() => setReminders([])}>{t("Got it")}</button>
            </div>
          )}
          <Routes>
            <Route path="/" element={<Daily />} />
            <Route path="/day-view" element={<DayOverview />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <footer>
            {" "}
            {t("Forest")} <span>✦</span> {t("Make room for mindful days")}{" "}
          </footer>
        </main>
      </div>
    </PlannerContext.Provider>
  );
}
