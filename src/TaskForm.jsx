import { useLanguage } from "./Language";
import React, { useState, useEffect } from "react";
import { uid, validateTask } from "./helpers";
import { usePlanner, categories } from "./context";

export default function TaskForm({ task, close }) {
  const { t, number } = useLanguage();
  const { data, dispatch, date, notify } = usePlanner();
  const [form, setForm] = useState({
    id: uid(),
    title: "",
    date,
    start: "09:00",
    end: "10:00",
    category: "یادگیری",
    points: 10,
    reminder: "0",
    status: "pending",
    ...task,
  });
  const [error, setError] = useState("");
  const update = (key, value) => setForm({ ...form, [key]: value });
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = previous;
    };
  }, []);
  function submit(e) {
    e.preventDefault();
    const message = validateTask(form, data.tasks);
    if (message) return setError(message);
    dispatch({ type: "saveTask", task: { ...form, title: form.title.trim() } });
    notify("Activity saved.");
    close();
  }
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <form
        className="modal"
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-title"
      >
        <div className="section-heading">
          <h2 id="form-title">
            {task.id ? t("Edit activity") : t("A new step")}
          </h2>
          <button type="button" onClick={close} aria-label={t("Close")}>
            ×
          </button>
        </div>
        <label>
          {" "}
          {t("Activity title")}{" "}
          <input
            autoFocus
            required
            maxLength={120}
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder={t("For example, review 10 new words")}
          />
        </label>
        <label>
          {" "}
          {t("Date")}{" "}
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
          />
        </label>
        <div className="form-row">
          <label>
            {" "}
            {t("Start")}{" "}
            <input
              type="time"
              required
              value={form.start}
              onChange={(e) => update("start", e.target.value)}
            />
          </label>
          <label>
            {" "}
            {t("End (up to 24:00)")}{" "}
            <input
              type="text"
              dir="ltr"
              required
              pattern="([01][0-9]|2[0-3]):[0-5][0-9]|24:00"
              placeholder="10:00"
              value={form.end}
              onChange={(e) => update("end", e.target.value)}
            />
          </label>
        </div>
        <div className="form-row">
          <label>
            {" "}
            {t("Category")}{" "}
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {t(c)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {" "}
            {t("Points")}{" "}
            <input
              type="number"
              min="0"
              max="1000"
              step="1"
              required
              disabled={task.status === "done"}
              value={form.points}
              onChange={(e) => update("points", Number(e.target.value))}
            />
          </label>
        </div>
        <label>
          {" "}
          {t("Reminder")}{" "}
          <select
            value={form.reminder}
            onChange={(e) => update("reminder", e.target.value)}
          >
            <option value="off">{t("No reminder")}</option>
            <option value="0">{t("At start time")}</option>
            {[5, 10, 15].map((n) => (
              <option key={n} value={n}>
                {number(n)} {t("minutes before")}{" "}
              </option>
            ))}
          </select>
        </label>
        {task.status === "done" && (
          <small>
            {" "}
            {t(
              "Completed activity points are locked. Undo completion before changing them.",
            )}{" "}
          </small>
        )}
        {error && (
          <p className="error" role="alert">
            {t(error)}
          </p>
        )}
        <div className="modal-buttons">
          <button className="primary" type="submit">
            {" "}
            {t("Save activity")}{" "}
          </button>
          <button type="button" className="outline" onClick={close}>
            {" "}
            {t("Cancel")}{" "}
          </button>
        </div>
      </form>
    </div>
  );
}
