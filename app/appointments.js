import { getState, updateState } from "./state.js";
import {
  compareTimes,
  isValidDate,
  isValidTime,
  normalizeText,
  timeToMinutes,
  uuid,
} from "./utils.js";

const STATUS_VALUES = ["planned", "done", "cancelled"];

function validateAppointmentInput(data, categories) {
  const errors = [];
  const title = String(data.title || "").trim();
  const date = String(data.date || "").trim();
  const startTime = String(data.startTime || "").trim();
  const endTime = String(data.endTime || "").trim();
  const categoryId = String(data.categoryId || "").trim();
  const location = String(data.location || "").trim();
  const notes = String(data.notes || "").trim();
  const status = String(data.status || "planned").trim();

  if (!title) {
    errors.push("Title is required.");
  }
  if (!date || !isValidDate(date)) {
    errors.push("Date is required and must be valid.");
  }
  if (!startTime || !isValidTime(startTime)) {
    errors.push("Start time is required and must be valid.");
  }
  if (endTime && !isValidTime(endTime)) {
    errors.push("End time must be valid.");
  }
  if (endTime && compareTimes(startTime, endTime) > 0) {
    errors.push("End time must be after start time.");
  }
  if (!categoryId) {
    errors.push("Category is required.");
  }
  const categoryExists = categories.some(
    (category) => category.id === categoryId
  );
  if (!categoryExists) {
    errors.push("Select a valid category.");
  }
  if (!STATUS_VALUES.includes(status)) {
    errors.push("Status must be planned, done, or cancelled.");
  }

  return {
    ok: errors.length === 0,
    errors,
    value: {
      title,
      date,
      startTime,
      endTime: endTime || "",
      categoryId,
      location,
      notes,
      status,
    },
  };
}

export function createAppointment(data) {
  const state = getState();
  const validation = validateAppointmentInput(data, state.categories);
  if (!validation.ok) {
    return validation;
  }
  const now = Date.now();
  const appointment = {
    id: uuid(),
    ...validation.value,
    createdAt: now,
    updatedAt: now,
  };

  updateState((draft) => {
    draft.appointments.push(appointment);
  });

  return { ok: true, value: appointment };
}

export function updateAppointment(id, data) {
  const state = getState();
  const validation = validateAppointmentInput(data, state.categories);
  if (!validation.ok) {
    return validation;
  }

  let updatedItem;
  updateState((draft) => {
    const index = draft.appointments.findIndex((item) => item.id === id);
    if (index === -1) {
      return;
    }
    const current = draft.appointments[index];
    updatedItem = {
      ...current,
      ...validation.value,
      updatedAt: Date.now(),
    };
    draft.appointments[index] = updatedItem;
  });

  if (!updatedItem) {
    return { ok: false, errors: ["Appointment not found."] };
  }

  return { ok: true, value: updatedItem };
}

export function deleteAppointment(id) {
  let removed = false;
  updateState((draft) => {
    const next = draft.appointments.filter((item) => item.id !== id);
    if (next.length !== draft.appointments.length) {
      removed = true;
      draft.appointments = next;
    }
  });
  return removed;
}

export function filterAppointments(appointments, filters) {
  const search = normalizeText(filters.search);
  const categoryId = normalizeText(filters.categoryId);
  const fromDate = filters.from || "";
  const toDate = filters.to || "";

  return appointments.filter((appointment) => {
    const matchesSearch = search
      ? [appointment.title, appointment.location, appointment.notes]
          .map(normalizeText)
          .some((value) => value.includes(search))
      : true;

    const matchesCategory = categoryId
      ? normalizeText(appointment.categoryId) === categoryId
      : true;

    const matchesFrom = fromDate
      ? appointment.date >= fromDate
      : true;
    const matchesTo = toDate ? appointment.date <= toDate : true;

    return matchesSearch && matchesCategory && matchesFrom && matchesTo;
  });
}

function compareDateTime(a, b) {
  if (a.date !== b.date) {
    return a.date.localeCompare(b.date);
  }
  const timeCompare = compareTimes(a.startTime, b.startTime);
  if (timeCompare !== 0) {
    return timeCompare;
  }
  return a.title.localeCompare(b.title);
}

export function sortAppointments(
  appointments,
  sortKey,
  categoriesById = new Map()
) {
  const list = [...appointments];
  if (sortKey === "dateDesc") {
    list.sort((a, b) => compareDateTime(b, a));
  } else if (sortKey === "category") {
    list.sort((a, b) => {
      const nameA = categoriesById.get(a.categoryId)?.name || "";
      const nameB = categoriesById.get(b.categoryId)?.name || "";
      const categoryCompare = nameA.localeCompare(nameB);
      if (categoryCompare !== 0) {
        return categoryCompare;
      }
      return compareDateTime(a, b);
    });
  } else if (sortKey === "createdAt") {
    list.sort((a, b) => b.createdAt - a.createdAt);
  } else {
    list.sort(compareDateTime);
  }
  return list;
}

export function getAppointmentById(id) {
  const state = getState();
  return state.appointments.find((item) => item.id === id) || null;
}

export function buildDefaultAppointment(categoryId) {
  return {
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    categoryId: categoryId || "general",
    location: "",
    notes: "",
    status: "planned",
  };
}

export function compareByStartTime(a, b) {
  const timeDiff = timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  if (timeDiff !== 0) {
    return timeDiff;
  }
  return a.title.localeCompare(b.title);
}
