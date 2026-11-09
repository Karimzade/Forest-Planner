import { test } from "node:test";
import assert from "node:assert/strict";
import messages from "../src/locales.json" with { type: "json" };
import {
  languages,
  translatedLanguages,
  interfaceLanguage,
  translate,
  initialLanguage,
  languageInfo,
  localizedDate,
  localizedNumber,
} from "../src/i18n.js";

test("all translated interface languages have a complete catalog", () => {
  for (const [key, translations] of Object.entries(messages)) {
    for (const code of translatedLanguages)
      assert.ok(translations[code]?.trim(), `${code}: ${key}`);
  }
});

test("broad catalog preserves locale choice and uses English for untranslated interfaces", () => {
  assert.equal(languages.length, 190);
  assert.equal(new Set(languages.map((item) => item.code)).size, 190);
  for (const code of ["es", "fr", "zh-Hans", "hi", "ur", "ja", "sw"]) {
    assert.equal(languageInfo(code).code, code);
    assert.equal(interfaceLanguage(code), "en");
    assert.equal(translate("Save activity", code), "Save activity");
  }
  assert.equal(languageInfo("he").dir, "rtl");
  assert.equal(interfaceLanguage("fa"), "fa");
});
test("English is the fresh default and invalid preferences fall back to English", () => {
  globalThis.localStorage = { getItem: () => null };
  assert.equal(initialLanguage(), "en");
  globalThis.localStorage = { getItem: () => "unsupported" };
  assert.equal(initialLanguage(), "en");
  globalThis.localStorage = { getItem: () => "uk" };
  assert.equal(initialLanguage(), "uk");
  delete globalThis.localStorage;
});
test("old category/status values translate without changing saved data", () => {
  assert.equal(translate("یادگیری", "de"), "Lernen");
  assert.equal(translate("انجام‌شده", "tr"), "Tamamlandı");
  assert.equal(translate("در انتظار"), "Pending");
});
test("parameterized messages and RTL languages", () => {
  assert.equal(
    translate("deleteConfirm", "en", { title: "<My task>" }),
    "Delete “<My task>”?",
  );
  assert.equal(
    translate("minutesUntil", "de", { n: 5 }),
    "Noch 5 Minuten bis zum Beginn",
  );
  assert.equal(languageInfo("ar").dir, "rtl");
  assert.equal(languageInfo("uk").dir, "ltr");
});
test("dates and numbers follow the chosen locale", () => {
  assert.equal(localizedNumber(1234, "en"), "1,234");
  assert.equal(localizedNumber(1234, "de"), "1.234");
  assert.match(localizedDate("2026-11-01", "de"), /2026/);
  assert.notEqual(
    localizedDate("2026-11-01", "en"),
    localizedDate("2026-11-01", "uk"),
  );
});
