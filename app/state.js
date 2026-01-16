import { deepClone } from "./utils.js";
import { loadState, saveState } from "./storage.js";

export const DEFAULT_CATEGORIES = [
  { id: "general", name: "General", color: "blue" },
  { id: "doctors", name: "Doctors", color: "red" },
  { id: "house", name: "House", color: "orange" },
  { id: "friends", name: "Friends", color: "green" },
  { id: "work", name: "Work", color: "indigo" },
];

export const DEFAULT_PREFERENCES = {
  activeTab: "appointments",
  appointmentFilters: {
    search: "",
    categoryId: "",
    from: "",
    to: "",
    sort: "dateAsc",
  },
  calendarRange: {
    from: "",
    to: "",
  },
};

export function buildDefaultState() {
  return {
    appointments: [],
    categories: deepClone(DEFAULT_CATEGORIES),
    preferences: deepClone(DEFAULT_PREFERENCES),
  };
}

let state = buildDefaultState();
const listeners = new Set();

function notify() {
  const snapshot = getState();
  listeners.forEach((listener) => listener(snapshot));
}

export function getState() {
  return deepClone(state);
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setState(nextState, options = {}) {
  state = deepClone(nextState);
  if (!options.skipSave) {
    saveState(state);
  }
  notify();
}

export function updateState(mutator, options = {}) {
  const draft = deepClone(state);
  const result = mutator(draft);
  const nextState = result ? result : draft;
  setState(nextState, options);
}

export function initState() {
  const loaded = loadState();
  const defaults = buildDefaultState();
  const loadedPreferences =
    loaded.preferences && typeof loaded.preferences === "object"
      ? loaded.preferences
      : {};
  const mergedPreferences = {
    ...defaults.preferences,
    ...loadedPreferences,
    appointmentFilters: {
      ...defaults.preferences.appointmentFilters,
      ...(loadedPreferences.appointmentFilters || {}),
    },
    calendarRange: {
      ...defaults.preferences.calendarRange,
      ...(loadedPreferences.calendarRange || {}),
    },
  };
  const loadedCategories = Array.isArray(loaded.categories)
    ? loaded.categories
    : [];
  const hasValidCategories = loadedCategories.every(
    (category) =>
      category &&
      typeof category === "object" &&
      typeof category.id === "string" &&
      typeof category.name === "string" &&
      typeof category.color === "string"
  );
  state = {
    appointments: Array.isArray(loaded.appointments)
      ? loaded.appointments
      : defaults.appointments,
    categories:
      loadedCategories.length > 0 && hasValidCategories
        ? loadedCategories
        : defaults.categories,
    preferences: mergedPreferences,
  };
  saveState(state);
  notify();
  return getState();
}

export function resetState() {
  setState(buildDefaultState());
}
