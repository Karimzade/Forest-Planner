import React, { useState } from "react";
import { LanguagePicker, useLanguage } from "./Language";
import { cleanName, readProfile, saveProfile } from "./profile";

export default function Welcome({ children }) {
  const { t, language, interfaceCode } = useLanguage();
  const [profile, setProfile] = useState(readProfile);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile?.name || "");
  const [error, setError] = useState("");

  function enter(event) {
    event.preventDefault();
    const next = { name: cleanName(name) };
    if (!next.name) return setError("Please enter your name.");
    try {
      saveProfile(next);
      setError("");
    } catch {
      return setError(
        "Your browser cannot save your profile. Enable local storage to continue.",
      );
    }
    setProfile(next);
    setEditing(false);
  }

  if (profile && !editing)
    return (
      <>
        <div
          className="profile-bar"
          lang={interfaceCode}
          dir={interfaceCode === "fa" || interfaceCode === "ar" ? "rtl" : "ltr"}
        >
          <span>❧ {t("Welcome, {name}", { name: profile.name })}</span>
          <button
            onClick={() => {
              setName(profile.name);
              setEditing(true);
            }}
          >
            {t("Edit name & language")}
          </button>
        </div>
        {children}
      </>
    );

  return (
    <main className="welcome-page" lang={interfaceCode}>
      <section className="welcome-card">
        <div className="welcome-symbol" aria-hidden="true">
          ❧
        </div>
        <span className="eyebrow dark">{t("A little growth, every day")}</span>
        <h1>{t("Welcome to Forest")}</h1>
        <p>{t("Choose your language and tell us your name to begin.")}</p>
        <form onSubmit={enter}>
          <LanguagePicker searchable />
          <label className="welcome-name">
            {t("Your name")}
            <input
              autoComplete="given-name"
              dir="auto"
              required
              maxLength={60}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("What should we call you?")}
            />
          </label>
          {error && (
            <p className="error" role="alert">
              {t(error)}
            </p>
          )}
          <button type="submit" className="primary">
            {t(editing ? "Save changes" : "Enter my planner")}{" "}
            <span aria-hidden="true">→</span>
          </button>
          {editing && (
            <button
              type="button"
              className="outline"
              onClick={() => {
                setError("");
                setEditing(false);
              }}
            >
              {t("Cancel")}
            </button>
          )}
        </form>
        <small className="welcome-privacy">
          {t(
            "Your name and plans are saved only in this browser. No account is created.",
          )}
        </small>
      </section>
    </main>
  );
}
