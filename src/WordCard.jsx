import { useLanguage } from "./Language";
import React, { useState } from "react";

import { usePlanner } from "./context";

export default function WordCard() {
  const { t, number } = useLanguage();
  const { data, dispatch, date, notify } = usePlanner();
  const [count, setCount] = useState(data.words[date] ?? "");
  const total = Object.values(data.words).reduce((s, n) => s + n, 0);
  function save(e) {
    e.preventDefault();
    dispatch({ type: "words", date, count: Number(count) });
    notify("Word count saved for this day.");
  }
  return (
    <section className="panel word-card">
      <span className="eyebrow dark">{t("ONE WORD AT A TIME")}</span>
      <h2>{t("How many words did you learn?")}</h2>
      <p>{t("Record new words for the selected day.")}</p>
      <form onSubmit={save}>
        <label className="word-input">
          <input
            aria-label={t("Daily word count")}
            type="number"
            min="0"
            max="10000"
            step="1"
            required
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />
          <span>{t("new words")}</span>
        </label>
        <button className="primary" type="submit">
          {" "}
          {t("Save word count")}{" "}
        </button>
      </form>
      <div className="word-total">
        <span>{t("All-time total")}</span>
        <strong>
          {number(total)} <small>{t("words")}</small>
        </strong>
      </div>
    </section>
  );
}
