import { test } from "node:test";
import assert from "node:assert/strict";
import { daySlots, clock } from "../src/daySlots.js";
test("agenda preserves adjacent activity titles, cross-hour tasks and free ranges", () => {
  const tasks = [
    {date:"2026-11-01",start:"09:15",end:"10:20",title:"Study",status:"done"},
    {date:"2026-11-01",start:"10:20",end:"11:00",title:"Walk",status:"pending"},
    {date:"2026-11-02",start:"11:00",end:"12:00",title:"Other day"},
  ];
  assert.deepEqual(daySlots(tasks,"2026-11-01").agenda, [
    {start:0,end:555,booked:false,titles:[]},
    {start:555,end:620,booked:true,titles:["Study"]},
    {start:620,end:660,booked:true,titles:["Walk"]},
    {start:660,end:1440,booked:false,titles:[]},
  ]);
});
const date = "2026-11-01";
const task = (start, end, status = "pending", day = date) => ({
  start,
  end,
  date: day,
  status,
});

test("an empty day has 24 free hours and exactly 1440 free minute cells", () => {
  const day = daySlots([], date);
  assert.equal(day.free, 1440);
  assert.equal(day.booked, 0);
  assert.equal(day.hours.length, 24);
  assert.equal(day.hours.flatMap((h) => h.cells).length, 1440);
  assert.deepEqual(day.hours[23].ranges, [
    { start: 1380, end: 1440, booked: false },
  ]);
});
test("cross-hour activity respects minute boundaries and produces exact ranges", () => {
  const day = daySlots([task("09:15", "10:20")], date);
  assert.equal(day.booked, 65);
  assert.equal(day.free, 1375);
  assert.equal(day.hours[9].booked, 45);
  assert.equal(day.hours[10].booked, 20);
  assert.deepEqual(day.hours[9].ranges, [
    { start: 540, end: 555, booked: false },
    { start: 555, end: 600, booked: true },
  ]);
  assert.equal(day.hours[10].cells[19], true);
  assert.equal(day.hours[10].cells[20], false);
});
test("adjacent and overlapping tasks count occupied minutes once, all statuses stay scheduled", () => {
  const day = daySlots(
    [
      task("08:00", "08:30", "done"),
      task("08:30", "09:00", "missed"),
      task("08:15", "08:45"),
      task("12:00", "13:00", "pending", "2026-11-02"),
    ],
    date,
  );
  assert.equal(day.booked, 60);
  assert.equal(day.hours[8].ranges.length, 1);
});
test("last minute and full-day scheduling include 23:59 and end exactly at 24:00", () => {
  assert.equal(daySlots([task("23:59", "24:00")], date).booked, 1);
  assert.equal(daySlots([task("00:00", "24:00")], date).booked, 1440);
  assert.equal(clock(1440), "24:00");
  assert.equal(clock(555), "09:15");
});

test("full-day ranges merge across hours and cover every minute without gaps", () => {
  const day = daySlots([task("09:15", "10:20"), task("14:00", "15:00")], date);
  assert.deepEqual(day.ranges, [
    {start:0,end:555,booked:false},
    {start:555,end:620,booked:true},
    {start:620,end:840,booked:false},
    {start:840,end:900,booked:true},
    {start:900,end:1440,booked:false},
  ]);
  assert.equal(day.ranges.reduce((sum,r) => sum+r.end-r.start,0),1440);
  assert.deepEqual(daySlots([],date).ranges,[{start:0,end:1440,booked:false}]);
  assert.deepEqual(daySlots([task("00:00","24:00")],date).ranges,[{start:0,end:1440,booked:true}]);
});
