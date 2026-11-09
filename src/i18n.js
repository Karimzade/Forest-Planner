// All language data lives outside React. Add a locale here and in locales.json.
import messages from "./locales.json" with { type: "json" };
import aliases from "./translation-keys.json" with { type: "json" };
import catalog from "./languages.json" with { type: "json" };

export const languages = catalog;
export const translatedLanguages = ["en", "de", "tr", "ar", "uk", "fa"];
export const interfaceLanguage = (code) =>
  translatedLanguages.includes(code) ? code : "en";

export const languageInfo = (code) =>
  languages.find((item) => item.code === code) || languages[0];
export function translate(key, language = "en", values = {}) {
  const message = messages[aliases[key] || key];
  const text = message?.[interfaceLanguage(language)] || message?.en || key;
  return text.replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match);
}
export const localizedNumber = (value, language = "en") =>
  Number(value).toLocaleString(languageInfo(language).locale);
export const localizedDate = (date, language = "en") =>
  new Date(`${date}T12:00:00`).toLocaleDateString(
    languageInfo(language).locale,
    {
      calendar: "gregory",
      year: "numeric",
      month: "short",
      day: "numeric",
      weekday: "short",
    },
  );

export function initialLanguage() {
  try {
    return languageInfo(localStorage.getItem("forest-language")).code;
  } catch {
    return "en";
  }
}
