import { minutes } from "./helpers.js";

export const clock = (minute) =>
  `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;

// A start minute is included, an end minute is excluded: 09:00–09:30 fills 30 cells.
export function daySlots(tasks, date) {
  const slots = Array(1440).fill(false);
  tasks
    .filter((task) => task.date === date)
    .forEach((task) => {
      const start = Math.max(0, minutes(task.start));
      const end = Math.min(1440, minutes(task.end));
      for (let minute = start; minute < end; minute++) slots[minute] = true;
    });
  const hours = Array.from({ length: 24 }, (_, hour) => {
    const cells = slots.slice(hour * 60, hour * 60 + 60);
    const booked = cells.filter(Boolean).length;
    const ranges = [];
    let start = 0;
    for (let end = 1; end <= 60; end++) {
      if (end === 60 || cells[end] !== cells[start]) {
        ranges.push({
          start: hour * 60 + start,
          end: hour * 60 + end,
          booked: cells[start],
        });
        start = end;
      }
    }
    return { hour, cells, booked, free: 60 - booked, ranges };
  });
  const booked = slots.filter(Boolean).length;
  const ranges = [];
  let start = 0;
  for (let end = 1; end <= 1440; end++) {
    if (end === 1440 || slots[end] !== slots[start]) {
      ranges.push({ start, end, booked: slots[start] });
      start = end;
    }
  }
  // Split at activity boundaries, even when two booked activities touch.
  const activities = tasks.filter((task) => task.date === date);
  const boundaries = [...new Set([0, 1440, ...activities.flatMap((task) =>
    [minutes(task.start), minutes(task.end)])])].sort((a, b) => a - b);
  const agenda = boundaries.slice(0, -1).map((start, index) => {
    const end = boundaries[index + 1];
    const titles = activities.filter((task) =>
      minutes(task.start) < end && minutes(task.end) > start).map((task) => task.title);
    return { start, end, booked: titles.length > 0, titles };
  });
  return { hours, ranges, agenda, booked, free: 1440 - booked };
}
