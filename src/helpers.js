import { translate } from "./i18n.js";
// Plain JavaScript: date, calculations, validation and downloads.
export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export const uid = () => crypto.randomUUID();
export const minutes = (time) =>
  Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
export const emptyData = { tasks: [], words: {}, reward: null, history: [] };
export function readData() {
  const raw = localStorage.getItem("forest-planner-v1");
  if (!raw) return emptyData;
  const data = JSON.parse(raw);
  if (!Array.isArray(data.tasks) || !data.words || !Array.isArray(data.history))
    throw Error("Invalid saved data");
  return data;
}
export function earned(data) {
  return data.tasks
    .filter((t) => t.status === "done")
    .reduce((sum, t) => sum + t.points, 0);
}
export function balance(data) {
  return earned(data) - data.history.reduce((sum, r) => sum + r.cost, 0);
}
export function summary(tasks) {
  const done = tasks.filter((t) => t.status === "done").length;
  return {
    total: tasks.length,
    done,
    missed: tasks.filter((t) => t.status === "missed").length,
    pending: tasks.filter((t) => t.status === "pending").length,
    percent: tasks.length ? Math.round((done / tasks.length) * 100) : null,
  };
}
export function validateTask(task, tasks) {
  if (!task.title.trim()) return "نام فعالیت را وارد کن.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(task.date)) return "تاریخ را انتخاب کن.";
  if (!task.start || !task.end || minutes(task.start) >= minutes(task.end))
    return "زمان پایان باید بعد از شروع باشد؛ برای پایان روز ۲۴:۰۰ را وارد کن.";
  if (!Number.isInteger(task.points) || task.points < 0 || task.points > 1000)
    return "امتیاز باید عدد صحیح بین صفر و ۱۰۰۰ باشد.";
  if (
    tasks.some(
      (t) =>
        t.id !== task.id &&
        t.date === task.date &&
        minutes(task.start) < minutes(t.end) &&
        minutes(task.end) > minutes(t.start),
    )
  )
    return "این بازه با یک فعالیت دیگر هم‌پوشانی دارد.";
  return "";
}
export function reducer(data, action) {
  switch (action.type) {
    case "saveTask":
      return {
        ...data,
        tasks: data.tasks.some((t) => t.id === action.task.id)
          ? data.tasks.map((t) => (t.id === action.task.id ? action.task : t))
          : [...data.tasks, action.task],
      };
    case "status": {
      const task = data.tasks.find((t) => t.id === action.id);
      if (
        !task ||
        (task.status === "done" &&
          action.status !== "done" &&
          balance(data) < task.points)
      )
        return data;
      return {
        ...data,
        tasks: data.tasks.map((t) =>
          t.id === action.id ? { ...t, status: action.status } : t,
        ),
      };
    }
    case "delete": {
      const task = data.tasks.find((t) => t.id === action.id);
      if (task?.status === "done" && balance(data) < task.points) return data;
      return { ...data, tasks: data.tasks.filter((t) => t.id !== action.id) };
    }
    case "copy":
      return { ...data, tasks: [...data.tasks, ...action.tasks] };
    case "words":
      return { ...data, words: { ...data.words, [action.date]: action.count } };
    case "reward":
      return { ...data, reward: action.reward };
    case "claim":
      if (!data.reward || balance(data) < data.reward.cost) return data;
      return {
        ...data,
        reward: null,
        history: [
          ...data.history,
          { ...data.reward, id: action.id, date: action.date },
        ],
      };
    default:
      return data;
  }
}
export function dailySeries(data) {
  const dates = [...data.tasks.map((t) => t.date), ...Object.keys(data.words)]
    .filter((d) => d <= today())
    .sort();
  if (!dates.length) return [];
  const result = [];
  const date = new Date(`${dates[0]}T12:00:00`);
  const end = new Date(`${today()}T12:00:00`);
  let cumulative = 0;
  while (date <= end) {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    cumulative += data.words[key] || 0;
    result.push({
      date: key,
      ...summary(data.tasks.filter((t) => t.date === key)),
      words: data.words[key] || 0,
      cumulative,
    });
    date.setDate(date.getDate() + 1);
  }
  return result;
}
function download(content, type, name) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function downloadReport(data, date, language = "en") {
  const labels = {
    done: "انجام‌شده",
    missed: "انجام‌نشده",
    pending: "در انتظار",
  };
  // Quote CSV cells and neutralize spreadsheet formula injection.
  const cell = (value) =>
    '"' +
    String(value)
      .replace(/^[=+@-]/, "'$&")
      .replaceAll('"', '""') +
    '"';
  const rows = [
    [
      translate("تاریخ", language),
      translate("فعالیت", language),
      translate("شروع", language),
      translate("پایان", language),
      translate("دسته‌بندی", language),
      translate("وضعیت", language),
      translate("امتیاز", language),
    ],
  ];
  data.tasks
    .filter((t) => t.date === date)
    .sort((a, b) => a.start.localeCompare(b.start))
    .forEach((t) =>
      rows.push([
        date,
        t.title,
        t.start,
        t.end,
        translate(t.category, language),
        translate(labels[t.status], language),
        t.points,
      ]),
    );
  const s = summary(data.tasks.filter((t) => t.date === date));
  rows.push(
    [],
    [translate("کل فعالیت‌ها", language), s.total],
    [translate("انجام‌شده", language), s.done],
    [translate("انجام‌نشده", language), s.missed],
    [translate("در انتظار", language), s.pending],
    [
      translate("درصد تحقق", language),
      s.percent ?? translate("بدون برنامه", language),
    ],
    [translate("لغات روز", language), data.words[date] || 0],
  );
  download(
    "\uFEFF" + rows.map((row) => row.map(cell).join(",")).join("\r\n"),
    "text/csv;charset=utf-8",
    `forest-report-${date}.csv`,
  );
}
export function downloadBackup(data) {
  download(
    JSON.stringify(data, null, 2),
    "application/json",
    "forest-backup.json",
  );
}
