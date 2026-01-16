import {
  CATEGORY_COLOR_IDS,
  compareTimes,
  isValidDate,
  isValidTime,
} from "./utils.js";

export const STORAGE_KEYS = {
  appointments: "app_appointments_v2",
  categories: "app_categories_v2",
  preferences: "app_preferences_v1",
};

const EXPORT_VERSION = 2;

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Swallow storage errors to keep the UI usable.
  }
}

export function loadState() {
  return {
    appointments: readJson(STORAGE_KEYS.appointments, []),
    categories: readJson(STORAGE_KEYS.categories, null),
    preferences: readJson(STORAGE_KEYS.preferences, {}),
  };
}

export function saveState(state) {
  writeJson(STORAGE_KEYS.appointments, state.appointments || []);
  writeJson(STORAGE_KEYS.categories, state.categories || []);
  writeJson(STORAGE_KEYS.preferences, state.preferences || {});
}

export function buildExportPayload(state) {
  return {
    version: EXPORT_VERSION,
    exportedAt: Date.now(),
    appointments: state.appointments || [],
    categories: state.categories || [],
    preferences: state.preferences || {},
  };
}

export function validateImportPayload(payload) {
  const errors = [];
  if (!payload || typeof payload !== "object") {
    return { valid: false, errors: ["File is not valid JSON data."] };
  }

  const categoryIds = new Set();
  if (!Array.isArray(payload.appointments)) {
    errors.push("Appointments data is missing.");
  }
  if (!Array.isArray(payload.categories)) {
    errors.push("Categories data is missing.");
  }
  if (payload.version !== EXPORT_VERSION) {
    errors.push("Unsupported export version.");
  }

  if (Array.isArray(payload.categories)) {
    payload.categories.forEach((category) => {
      if (!category || typeof category !== "object") {
        errors.push("Each category must be an object.");
        return;
      }
      if (!category.id || typeof category.id !== "string") {
        errors.push("Category id is required.");
      }
      if (!category.name || typeof category.name !== "string") {
        errors.push("Category name is required.");
      }
      if (
        !category.color ||
        !CATEGORY_COLOR_IDS.includes(category.color)
      ) {
        errors.push("Category color is invalid.");
      }
      if (typeof category.id === "string") {
        categoryIds.add(category.id);
      }
    });
  }

  if (Array.isArray(payload.appointments)) {
    payload.appointments.forEach((appointment) => {
      if (!appointment || typeof appointment !== "object") {
        errors.push("Each appointment must be an object.");
        return;
      }
      if (!appointment.title || typeof appointment.title !== "string") {
        errors.push("Appointment title is required.");
      }
      if (!appointment.date || !isValidDate(appointment.date)) {
        errors.push(`Appointment date "${appointment.date}" is invalid.`);
      }
      if (!appointment.startTime || !isValidTime(appointment.startTime)) {
        errors.push("Appointment start time is invalid.");
      }
      if (
        appointment.endTime &&
        !isValidTime(appointment.endTime)
      ) {
        errors.push("Appointment end time is invalid.");
      }
      if (
        appointment.endTime &&
        appointment.startTime &&
        compareTimes(appointment.startTime, appointment.endTime) > 0
      ) {
        errors.push("Appointment end time must be after start time.");
      }
      if (
        !appointment.categoryId ||
        typeof appointment.categoryId !== "string"
      ) {
        errors.push("Appointment categoryId is required.");
      } else if (
        categoryIds.size > 0 &&
        !categoryIds.has(appointment.categoryId)
      ) {
        errors.push("Appointment categoryId does not exist.");
      }
      if (
        !appointment.status ||
        !["planned", "done", "cancelled"].includes(appointment.status)
      ) {
        errors.push("Appointment status is invalid.");
      }
      if (typeof appointment.createdAt !== "number") {
        errors.push("Appointment createdAt is invalid.");
      }
      if (typeof appointment.updatedAt !== "number") {
        errors.push("Appointment updatedAt is invalid.");
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

export function normalizeImportPayload(payload) {
  const categories = Array.isArray(payload.categories)
    ? payload.categories.map((item) => ({ ...item }))
    : [];
  const appointments = Array.isArray(payload.appointments)
    ? payload.appointments.map((item) => ({ ...item }))
    : [];
  const preferences =
    payload.preferences && typeof payload.preferences === "object"
      ? { ...payload.preferences }
      : {};

  const categoryById = new Map();
  categories.forEach((category) => {
    if (category && typeof category.id === "string") {
      categoryById.set(category.id, category);
    }
  });
  appointments.forEach((appointment) => {
    const categoryId =
      typeof appointment.categoryId === "string"
        ? appointment.categoryId
        : "general";
    appointment.categoryId = categoryId;
    if (!categoryById.has(categoryId)) {
      appointment.categoryId = "general";
    }
  });

  if (categories.length === 0) {
    categories.push({
      id: "general",
      name: "General",
      color: "blue",
    });
  }

  return { appointments, categories, preferences };
}
