import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanName, readProfile, saveProfile } from "../src/profile.js";

test("profile starts empty, supports Unicode names, persists, and rejects damaged data", () => {
  let stored = null;
  globalThis.localStorage = {
    getItem: () => stored,
    setItem: (key, value) => {
      stored = value;
    },
  };
  assert.equal(readProfile(), null);
  assert.equal(cleanName("  Hadis   Müller  "), "Hadis Müller");
  saveProfile({ name: "حدیث" });
  assert.deepEqual(readProfile(), { name: "حدیث" });
  stored = "{broken";
  assert.equal(readProfile(), null);
  stored = '{"name":"  "}';
  assert.equal(readProfile(), null);
  stored = '{"name":7}';
  assert.equal(readProfile(), null);
  delete globalThis.localStorage;
});
