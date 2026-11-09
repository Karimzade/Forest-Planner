import { test } from "node:test";
import assert from "node:assert/strict";
import {
  reducer,
  balance,
  summary,
  dailySeries,
  validateTask,
  today,
} from "../src/helpers.js";
const base = () => ({
  tasks: [
    {
      id: "a",
      title: "Study",
      date: today(),
      start: "09:00",
      end: "10:00",
      points: 20,
      status: "pending",
    },
  ],
  words: {},
  reward: null,
  history: [],
});

test("restored progress series reports completion and vocabulary totals", () => {
  let data = reducer(base(), { type: "status", id: "a", status: "done" });
  data = reducer(data, { type: "words", date: today(), count: 12 });
  const rows = dailySeries(data);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].percent, 100);
  assert.equal(rows[0].words, 12);
  assert.equal(rows[0].cumulative, 12);
  assert.deepEqual(dailySeries({ tasks: [], words: {} }), []);
});
test("completion is idempotent; undo reverses points", () => {
  let d = reducer(base(), { type: "status", id: "a", status: "done" });
  d = reducer(d, { type: "status", id: "a", status: "done" });
  assert.equal(balance(d), 20);
  d = reducer(d, { type: "status", id: "a", status: "pending" });
  assert.equal(balance(d), 0);
});
test("claim spends once and prevents deleting spent earnings", () => {
  let d = reducer(base(), { type: "status", id: "a", status: "done" });
  d = reducer(d, { type: "reward", reward: { title: "Cinema", cost: 15 } });
  d = reducer(d, { type: "claim", id: "r", date: today() });
  assert.equal(balance(d), 5);
  assert.equal(
    reducer(d, { type: "claim", id: "r2", date: today() }).history.length,
    1,
  );
  assert.equal(reducer(d, { type: "delete", id: "a" }).tasks.length, 1);
  assert.equal(
    reducer(d, { type: "status", id: "a", status: "missed" }).tasks[0].status,
    "done",
  );
});
test("word updates replace the day's count without adding it twice", () => {
  let d = reducer(base(), { type: "words", date: today(), count: 10 });
  d = reducer(d, { type: "words", date: today(), count: 12 });
  assert.equal(d.words[today()], 12);
  assert.equal(
    Object.values(d.words).reduce((sum, count) => sum + count, 0),
    12,
  );
});
test("overlap rejected, touching intervals accepted, midnight end allowed", () => {
  const d = base();
  const t = { ...d.tasks[0], id: "b", start: "09:30", end: "10:30" };
  assert.ok(validateTask(t, d.tasks));
  assert.equal(validateTask({ ...t, start: "10:00" }, d.tasks), "");
  assert.equal(
    validateTask({ ...t, start: "23:59", end: "24:00" }, d.tasks),
    "",
  );
  assert.ok(validateTask({ ...t, start: "10:00", end: "09:00" }, d.tasks));
});
test("blank day has no percentage; all three statuses counted", () => {
  assert.equal(summary([]).percent, null);
  const s = summary([
    { status: "done" },
    { status: "pending" },
    { status: "missed" },
  ]);
  assert.deepEqual(s, {
    total: 3,
    done: 1,
    pending: 1,
    missed: 1,
    percent: 33,
  });
});
