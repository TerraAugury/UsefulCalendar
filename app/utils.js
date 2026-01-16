const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export function deepClone(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

export function uuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const rand = (Math.random() * 16) | 0;
    const value = char === "x" ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

export function normalizeCategoryName(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
}

export function isValidDate(value) {
  if (!ISO_DATE_RE.test(value)) {
    return false;
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function isValidTime(value) {
  if (!TIME_RE.test(value)) {
    return false;
  }
  const [hour, minute] = value.split(":").map(Number);
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
}

export function timeToMinutes(value) {
  if (!isValidTime(value)) {
    return null;
  }
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export function compareTimes(a, b) {
  const minutesA = timeToMinutes(a);
  const minutesB = timeToMinutes(b);
  if (minutesA === null || minutesB === null) {
    return 0;
  }
  if (minutesA < minutesB) {
    return -1;
  }
  if (minutesA > minutesB) {
    return 1;
  }
  return 0;
}

export function formatDateLabel(dateString) {
  if (!isValidDate(dateString)) {
    return dateString;
  }
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function todayISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function debounce(fn, delay = 250) {
  let timer;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}

export const CATEGORY_COLOR_IDS = [
  "blue",
  "green",
  "orange",
  "red",
  "purple",
  "teal",
  "indigo",
  "pink",
  "yellow",
  "gray",
];
