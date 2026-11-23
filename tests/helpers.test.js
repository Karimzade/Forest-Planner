import { test } from "node:test";
import assert from "node:assert/strict";
import {
  reducer,
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

test("progress series uses activities only", () => {
  const data = reducer(base(), {
    type: "status",
    id: "a",
    status: "done",
  });

  // Old vocabulary data must not add dates to planner progress.
  data.words = { "2000-01-01": 12 };

  const rows = dailySeries(data);

  assert.equal(rows.length, 1);
  assert.equal(rows[0].date, today());
  assert.equal(rows[0].percent, 100);
  assert.equal("words" in rows[0], false);
  assert.equal("cumulative" in rows[0], false);
  assert.deepEqual(dailySeries({ tasks: [] }), []);
});
test("completion is idempotent and can be undone", () => {
  let data = reducer(base(), {
    type: "status",
    id: "a",
    status: "done",
  });

  data = reducer(data, {
    type: "status",
    id: "a",
    status: "done",
  });

  assert.equal(data.tasks.length, 1);
  assert.equal(summary(data.tasks).done, 1);

  data = reducer(data, {
    type: "status",
    id: "a",
    status: "pending",
  });

  assert.equal(data.tasks[0].status, "pending");
  assert.equal(summary(data.tasks).done, 0);
});
test("old reward history does not block changing or deleting activities", () => {
  const data = base();
  data.tasks[0].status = "done";
  data.history = [{ title: "Old reward", cost: 20 }];

  const updated = reducer(data, {
    type: "status",
    id: "a",
    status: "pending",
  });
  assert.equal(updated.tasks[0].status, "pending");

  const deleted = reducer(data, {
    type: "delete",
    id: "a",
  });
  assert.equal(deleted.tasks.length, 0);
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
