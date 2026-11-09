import React, { useState } from "react";
import { Link } from "react-router-dom";
import { usePlanner } from "./context";
import { useLanguage } from "./Language";
import { daySlots, clock } from "./daySlots";

export default function DayOverview() {
  const { data, date, setDate } = usePlanner();
  const { t, number, formatDate } = useLanguage();
  const [selectedHour, setSelectedHour] = useState(0);
  const day = daySlots(data.tasks, date);
  const label = (range) => range.booked ? range.titles.join(" · ") : t("Free");
  const selectedRanges = day.agenda.filter((range) =>
    range.start < (selectedHour + 1) * 60 && range.end > selectedHour * 60
  ).map((range) => ({ ...range, start: Math.max(range.start, selectedHour * 60),
    end: Math.min(range.end, (selectedHour + 1) * 60) }));
  const duration = (value) =>
    t("{hours} h {minutes} min", {
      hours: number(Math.floor(value / 60)),
      minutes: number(value % 60),
    });

  return (
    <section className="day-overview">
      <div className="overview-heading">
        <div>
          <span className="eyebrow dark">{t("24-hour view")}</span>
          <h1>{t("Your day at a glance")}</h1>
          <p>
            {t("See free and scheduled minutes without changing your plan.")}
          </p>
        </div>
        <Link className="outline" to="/">
          {t("Back to my day")}
        </Link>
      </div>
      <div className="overview-date">
        <strong>{formatDate(date)}</strong>
        <label className="date-picker">
          {t("Date")}
          <input
            type="date"
            aria-label={t("Schedule date")}
            value={date}
            onChange={(event) => {
              if (event.target.value) setDate(event.target.value);
            }}
          />
        </label>
      </div>
      <div className="time-totals">
        <div className="time-total free-total">
          <span className="time-swatch free-swatch" />
          <div>
            <small>{t("Free time")}</small>
            <strong>{duration(day.free)}</strong>
          </div>
        </div>
        <div className="time-total booked-total">
          <span className="time-swatch booked-swatch" />
          <div>
            <small>{t("Scheduled time")}</small>
            <strong>{duration(day.booked)}</strong>
          </div>
        </div>
      </div>
      <div
        className="panel day-timeline-panel"
      >
        <h2>{t("Daily time map")}</h2>
        <div className="day-timeline" dir="ltr" aria-label={t("Daily time map")}>
          {day.agenda.map((range) => (
            <div key={range.start} className={range.booked ? "timeline-booked" : "timeline-free"}
              style={{ flex: range.end - range.start }}
              title={`${clock(range.start)}–${clock(range.end)} · ${label(range)}`}>
              {range.booked && <span dir="auto">{label(range)}</span>}
            </div>
          ))}
        </div>
        <div className="timeline-labels" dir="ltr"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>
        <div className="time-key"><span><i className="free-swatch" />{t("Free")}</span><span><i className="booked-swatch" />{t("Booked")}</span></div>
        <h2>{t("All daily time ranges")}</h2>
        <div className="time-table-scroll">
          <table className="daily-time-table">
            <thead><tr><th>{t("From")}</th><th>{t("Until")}</th><th>{t("Duration")}</th><th>{t("Activity title")}</th><th>{t("Availability")}</th></tr></thead>
            <tbody>{day.agenda.map((range) => (
              <tr key={range.start} className={range.booked ? "booked-range" : "free-range"}>
                <td><bdi dir="ltr">{clock(range.start)}</bdi></td>
                <td><bdi dir="ltr">{clock(range.end)}</bdi></td>
                <td>{duration(range.end - range.start)}</td>
                <td className="agenda-title" dir="auto">{range.booked ? label(range) : "—"}</td>
                <td>{t(range.booked ? "Booked" : "Free")}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      <div
        className="hour-detail panel"
        role="region"
        aria-label={t("Selected hour")}
        aria-live="polite"
      >
        <div className="hour-detail-heading">
          <div>
            <span className="eyebrow dark">{t("Selected hour")}</span>
            <h2>
              <bdi dir="ltr">
                {clock(selectedHour * 60)} — {clock((selectedHour + 1) * 60)}
              </bdi>
            </h2>
          </div>
          <p>{t("Select an hour to see exact time ranges.")}</p>
        </div>
        <div className="hour-ranges">
          {selectedRanges.map((range) => (
            <div
              className={
                range.booked
                  ? "time-range booked-range"
                  : "time-range free-range"
              }
              key={range.start}
            >
              <span dir="auto">{label(range)}</span>
              <bdi dir="ltr">
                {clock(range.start)} — {clock(range.end)}
              </bdi>
              <small>
                {t("{count} min", { count: number(range.end - range.start) })}
              </small>
            </div>
          ))}
        </div>
      </div>
      <div className="time-key">
        <span>
          <i className="free-swatch" />
          {t("Free")}
        </span>
        <span>
          <i className="booked-swatch" />
          {t("Booked")}
        </span>
        <p>
          {t("Each square is one minute. Read left to right, top to bottom.")}
        </p>
      </div>
      <div className="hour-grid" aria-label={t("24-hour view")}>
        {day.hours.map((hour) => (
          <button
            type="button"
            key={hour.hour}
            className={
              "hour-card " +
              (selectedHour === hour.hour ? "selected-hour " : "") +
              (hour.booked === 60
                ? "full-hour"
                : hour.booked
                  ? "mixed-hour"
                  : "free-hour")
            }
            aria-pressed={selectedHour === hour.hour}
            onClick={() => setSelectedHour(hour.hour)}
            aria-label={`${clock(hour.hour * 60)}–${clock((hour.hour + 1) * 60)} · ${t("{free} min free · {booked} min booked", { free: number(hour.free), booked: number(hour.booked) })}`}
          >
            <div className="hour-card-heading">
              <strong dir="ltr">{clock(hour.hour * 60)}</strong>
              <span>
                {t(
                  hour.booked === 60
                    ? "Fully booked"
                    : hour.booked
                      ? "Partly booked"
                      : "All free",
                )}
              </span>
            </div>
            <div className="minute-grid" dir="ltr" aria-hidden="true">
              {hour.cells.map((booked, minute) => (
                <span
                  key={minute}
                  className={
                    booked
                      ? "minute-cell booked-minute"
                      : "minute-cell free-minute"
                  }
                  title={`${clock(hour.hour * 60 + minute)}–${clock(hour.hour * 60 + minute + 1)} · ${t(booked ? "Booked" : "Free")}`}
                />
              ))}
            </div>
            <div className="hour-activities">
              {day.agenda.filter((range) => range.booked && range.start < (hour.hour + 1) * 60 && range.end > hour.hour * 60).map((range) => (
                <span key={range.start} dir="auto"><bdi dir="ltr">{clock(Math.max(range.start, hour.hour * 60))}–{clock(Math.min(range.end, (hour.hour + 1) * 60))}</bdi> · {label(range)}</span>
              ))}
            </div>
            <small className="hour-card-summary">
              {t("{free} min free · {booked} min booked", {
                free: number(hour.free),
                booked: number(hour.booked),
              })}
            </small>
          </button>
        ))}
      </div>
      {day.booked === 0 && (
        <p className="day-free-note">
          ❧ {t("No activities scheduled. Your whole day is free.")}
        </p>
      )}
      <p className="overview-note">
        {t("This shows planned time, regardless of completion status.")}
      </p>
    </section>
  );
}
