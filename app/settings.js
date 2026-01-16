import { buildExportPayload, normalizeImportPayload } from "./storage.js";
import {
  DEFAULT_PREFERENCES,
  getState,
  resetState,
  setState,
} from "./state.js";

export function getExportText() {
  const payload = buildExportPayload(getState());
  return JSON.stringify(payload, null, 2);
}

export function applyImportPayload(payload) {
  const normalized = normalizeImportPayload(payload);
  const preferences = {
    ...DEFAULT_PREFERENCES,
    ...normalized.preferences,
    appointmentFilters: {
      ...DEFAULT_PREFERENCES.appointmentFilters,
      ...(normalized.preferences || {}).appointmentFilters,
    },
    calendarRange: {
      ...DEFAULT_PREFERENCES.calendarRange,
      ...(normalized.preferences || {}).calendarRange,
    },
  };
  setState({
    appointments: normalized.appointments,
    categories: normalized.categories,
    preferences,
  });
}

export function resetAllData() {
  resetState();
}
