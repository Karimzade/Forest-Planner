import React, { createContext, useContext, useState, useEffect } from "react";
import {
  languages,
  initialLanguage,
  languageInfo,
  translate,
  localizedDate,
  localizedNumber,
  interfaceLanguage,
} from "./i18n";

const LanguageContext = createContext(null);
export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(initialLanguage);
  const interfaceCode = interfaceLanguage(language);
  const t = (key, values) => translate(key, language, values);
  const number = (value) => localizedNumber(value, language);
  const formatDate = (date) => localizedDate(date, language);

  useEffect(() => {
    const info = languageInfo(interfaceCode);
    document.documentElement.lang = interfaceCode;
    document.documentElement.dir = info.dir;
    document.title = `${t("Forest")} | ${t("Daily schedule")}`;
    try {
      localStorage.setItem("forest-language", language);
    } catch {
      /* The selection still works for this visit. */
    }
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t, number, formatDate, interfaceCode }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function LanguagePicker({ searchable = false }) {
  const { language, setLanguage, t, interfaceCode } = useLanguage();
  const [query, setQuery] = useState("");
  const matches = languages.filter((item) =>
    `${item.name} ${item.english} ${item.code}`
      .toLocaleLowerCase()
      .includes(query.toLocaleLowerCase().trim()),
  );
  const choices = matches.some((item) => item.code === language)
    ? matches
    : [languageInfo(language), ...matches];
  return (
    <div className="language-control">
      {searchable && (
        <label className="language-search">
          {t("Search languages")}
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("Search by name or language code")}
          />
        </label>
      )}
      <label className="language-picker">
        <span>◎ {t("Language")}</span>
        <select
          aria-label={t("Language")}
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {choices.map((item) => (
            <option key={item.code} value={item.code} lang={item.code}>
              {item.name === item.english
                ? item.name
                : `${item.name} — ${item.english}`}{" "}
              [{item.code}]
            </option>
          ))}
        </select>
      </label>
      {searchable && (
        <small className="language-count">
          {t("{count} language choices", { count: languages.length })}
        </small>
      )}
      {searchable && !matches.length && (
        <small role="status">
          {t("No matching language. Try an English name or language code.")}
        </small>
      )}
      {language !== interfaceCode && (
        <small className="language-fallback" role="status">
          {t(
            "This interface is currently available in English for your language. Dates and numbers use your selected locale.",
          )}
        </small>
      )}
    </div>
  );
}
