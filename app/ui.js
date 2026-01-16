import {
  buildDefaultAppointment,
  createAppointment,
  deleteAppointment,
  filterAppointments,
  getAppointmentById,
  sortAppointments,
  updateAppointment,
} from "./appointments.js";
import { addCategory } from "./categories.js";
import { groupAppointmentsByDate, filterByRange } from "./calendar.js";
import {
  buildOptions,
  createAgendaGroup,
  createAppointmentCard,
  createCategoryCard,
} from "./components.js";
import { initRouter } from "./router.js";
import { sampleData } from "./sample-data.js";
import { validateImportPayload } from "./storage.js";
import { applyImportPayload, getExportText, resetAllData } from "./settings.js";
import { getState, subscribe, updateState } from "./state.js";
import { CATEGORY_COLOR_IDS, debounce, todayISO } from "./utils.js";

const refs = {};

export function initUI() {
  cacheDom();
  wireEvents();

  const state = getState();
  initRouter({
    buttons: refs.navButtons,
    sections: Object.values(refs.sections),
    initialTab: state.preferences.activeTab,
    onTabChange: (tab) => {
      updateState((draft) => {
        draft.preferences.activeTab = tab;
      });
    },
  });

  subscribe(render);
  render(state);
}

function cacheDom() {
  refs.sections = {
    appointments: document.getElementById("appointments"),
    calendar: document.getElementById("calendar"),
    categories: document.getElementById("categories"),
    settings: document.getElementById("settings"),
  };
  refs.navButtons = Array.from(document.querySelectorAll(".nav-btn"));

  refs.newAppointmentBtn = document.getElementById("new-appointment-btn");
  refs.appointmentsList = document.getElementById("appointments-list");
  refs.appointmentsEmpty = document.getElementById("appointments-empty");
  refs.filterSearch = document.getElementById("filter-search");
  refs.filterCategory = document.getElementById("filter-category");
  refs.filterFrom = document.getElementById("filter-from");
  refs.filterTo = document.getElementById("filter-to");
  refs.filterSort = document.getElementById("filter-sort");

  refs.calendarFrom = document.getElementById("calendar-from");
  refs.calendarTo = document.getElementById("calendar-to");
  refs.calendarAgenda = document.getElementById("calendar-agenda");
  refs.calendarEmpty = document.getElementById("calendar-empty");

  refs.categoryForm = document.getElementById("category-form");
  refs.categoryName = document.getElementById("category-name");
  refs.categoryColor = document.getElementById("category-color");
  refs.categoryColorDot = document.getElementById("category-color-dot");
  refs.categoriesList = document.getElementById("categories-list");

  refs.exportBtn = document.getElementById("export-btn");
  refs.loadSampleBtn = document.getElementById("load-sample-btn");
  refs.importFile = document.getElementById("import-file");
  refs.importStatus = document.getElementById("import-status");
  refs.resetBtn = document.getElementById("reset-btn");

  refs.modal = document.getElementById("appointment-modal");
  refs.modalBackdrop = refs.modal.querySelector("[data-close-modal]");
  refs.modalTitle = document.getElementById("appointment-modal-title");
  refs.closeModalBtn = document.getElementById("close-appointment-modal");
  refs.cancelAppointmentBtn = document.getElementById(
    "cancel-appointment-btn"
  );
  refs.deleteAppointmentBtn = document.getElementById(
    "delete-appointment-btn"
  );
  refs.saveAppointmentBtn = document.getElementById("save-appointment-btn");
  refs.appointmentForm = document.getElementById("appointment-form");
  refs.appointmentErrors = document.getElementById("appointment-errors");
  refs.appointmentId = document.getElementById("appointment-id");
  refs.appointmentTitle = document.getElementById("appointment-title");
  refs.appointmentDate = document.getElementById("appointment-date");
  refs.appointmentStart = document.getElementById("appointment-start");
  refs.appointmentEnd = document.getElementById("appointment-end");
  refs.appointmentCategory = document.getElementById(
    "appointment-category"
  );
  refs.appointmentStatus = document.getElementById("appointment-status");
  refs.appointmentLocation = document.getElementById(
    "appointment-location"
  );
  refs.appointmentNotes = document.getElementById("appointment-notes");

  refs.toastContainer = document.getElementById("toast-container");
}

function wireEvents() {
  refs.newAppointmentBtn.addEventListener("click", () => {
    openAppointmentModal();
  });

  refs.modalBackdrop.addEventListener("click", closeAppointmentModal);
  refs.closeModalBtn.addEventListener("click", closeAppointmentModal);
  refs.cancelAppointmentBtn.addEventListener("click", closeAppointmentModal);

  refs.appointmentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = readAppointmentForm();
    const id = refs.appointmentId.value;
    const result = id
      ? updateAppointment(id, formData)
      : createAppointment(formData);
    if (!result.ok) {
      renderFormErrors(result.errors);
      return;
    }
    closeAppointmentModal();
    showToast(
      id ? "Appointment updated." : "Appointment created.",
      "success"
    );
  });

  refs.deleteAppointmentBtn.addEventListener("click", () => {
    const id = refs.appointmentId.value;
    if (!id) {
      return;
    }
    const ok = window.confirm(
      "Delete this appointment? This cannot be undone."
    );
    if (!ok) {
      return;
    }
    const removed = deleteAppointment(id);
    if (removed) {
      closeAppointmentModal();
      showToast("Appointment deleted.", "success");
    }
  });

  refs.appointmentsList.addEventListener("click", (event) => {
    const card = event.target.closest(".appointment-card");
    if (!card) {
      return;
    }
    const appointment = getAppointmentById(card.dataset.id);
    if (appointment) {
      openAppointmentModal(appointment);
    }
  });

  const updateSearch = debounce((value) => {
    updateAppointmentFilters({ search: value });
  }, 250);

  refs.filterSearch.addEventListener("input", (event) => {
    updateSearch(event.target.value);
  });
  refs.filterCategory.addEventListener("change", (event) => {
    updateAppointmentFilters({ categoryId: event.target.value });
  });
  refs.filterFrom.addEventListener("change", (event) => {
    updateAppointmentFilters({ from: event.target.value });
  });
  refs.filterTo.addEventListener("change", (event) => {
    updateAppointmentFilters({ to: event.target.value });
  });
  refs.filterSort.addEventListener("change", (event) => {
    updateAppointmentFilters({ sort: event.target.value });
  });

  refs.categoryColor.addEventListener("change", (event) => {
    updateCategoryColorPreview(event.target.value);
  });

  refs.categoryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const result = addCategory(
      refs.categoryName.value,
      refs.categoryColor.value
    );
    if (!result.ok) {
      showToast(result.error, "error");
      return;
    }
    refs.categoryName.value = "";
    refs.categoryColor.value = "blue";
    updateCategoryColorPreview(refs.categoryColor.value);
    showToast("Category added.", "success");
  });

  refs.calendarFrom.addEventListener("change", (event) => {
    updateCalendarRange({ from: event.target.value });
  });
  refs.calendarTo.addEventListener("change", (event) => {
    updateCalendarRange({ to: event.target.value });
  });

  refs.exportBtn.addEventListener("click", () => {
    const text = getExportText();
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `appointments-backup-${todayISO()}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("Export ready.", "success");
  });

  refs.loadSampleBtn.addEventListener("click", () => {
    const ok = window.confirm(
      "Load sample data? This will replace existing data."
    );
    if (!ok) {
      return;
    }
    applyImportPayload(sampleData);
    refs.importStatus.textContent = "Sample data loaded.";
    showToast("Sample data loaded.", "success");
  });

  refs.importFile.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(reader.result);
        const validation = validateImportPayload(payload);
        if (!validation.valid) {
          refs.importStatus.textContent = validation.errors[0];
          showToast("Import failed.", "error");
          return;
        }
        const ok = window.confirm(
          "Import will replace existing data. Continue?"
        );
        if (!ok) {
          refs.importStatus.textContent = "Import cancelled.";
          return;
        }
        applyImportPayload(payload);
        refs.importStatus.textContent = "Import complete.";
        showToast("Import complete.", "success");
      } catch (error) {
        refs.importStatus.textContent = "Import failed. Invalid JSON.";
        showToast("Import failed.", "error");
      } finally {
        refs.importFile.value = "";
      }
    };
    reader.readAsText(file);
  });

  refs.resetBtn.addEventListener("click", () => {
    const ok = window.confirm(
      "Clear all appointments and categories? This cannot be undone."
    );
    if (!ok) {
      return;
    }
    resetAllData();
    showToast("All data cleared.", "success");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !refs.modal.hidden) {
      closeAppointmentModal();
    }
  });
}

function updateAppointmentFilters(changes) {
  updateState((draft) => {
    draft.preferences.appointmentFilters = {
      ...draft.preferences.appointmentFilters,
      ...changes,
    };
  });
}

function updateCalendarRange(changes) {
  updateState((draft) => {
    draft.preferences.calendarRange = {
      ...draft.preferences.calendarRange,
      ...changes,
    };
  });
}

function render(state) {
  renderFilters(state);
  renderAppointments(state);
  renderCategoryForm();
  renderCategories(state);
  renderCalendar(state);
}

function mapCategoriesToOptions(categories) {
  return categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));
}

function renderFilters(state) {
  const filterState = state.preferences.appointmentFilters;
  const currentCategory = refs.appointmentCategory.value;

  refs.filterSearch.value = filterState.search;
  refs.filterFrom.value = filterState.from;
  refs.filterTo.value = filterState.to;

  refs.filterCategory.innerHTML = "";
  refs.filterCategory.append(
    buildOptions(mapCategoriesToOptions(state.categories), {
      includeAll: true,
    })
  );
  refs.filterCategory.value = filterState.categoryId;

  refs.filterSort.value = filterState.sort;

  refs.appointmentCategory.innerHTML = "";
  refs.appointmentCategory.append(
    buildOptions(mapCategoriesToOptions(state.categories))
  );
  if (currentCategory) {
    refs.appointmentCategory.value = currentCategory;
  }
}

function renderCategoryForm() {
  if (refs.categoryColor.options.length === 0) {
    const colorOptions = CATEGORY_COLOR_IDS.map((color) => ({
      value: color,
      label: color.charAt(0).toUpperCase() + color.slice(1),
    }));
    refs.categoryColor.append(buildOptions(colorOptions));
  }
  if (!refs.categoryColor.value) {
    refs.categoryColor.value = "blue";
  }
  updateCategoryColorPreview(refs.categoryColor.value);
}

function renderAppointments(state) {
  const filterState = state.preferences.appointmentFilters;
  const filtered = filterAppointments(state.appointments, filterState);
  const categoriesById = new Map(
    state.categories.map((category) => [category.id, category])
  );
  const sorted = sortAppointments(
    filtered,
    filterState.sort,
    categoriesById
  );

  refs.appointmentsList.innerHTML = "";
  sorted.forEach((appointment) => {
    const category = categoriesById.get(appointment.categoryId);
    refs.appointmentsList.append(
      createAppointmentCard(appointment, category)
    );
  });

  refs.appointmentsEmpty.hidden = sorted.length > 0;
}

function renderCategories(state) {
  const counts = state.appointments.reduce((acc, appointment) => {
    acc[appointment.categoryId] =
      (acc[appointment.categoryId] || 0) + 1;
    return acc;
  }, {});

  refs.categoriesList.innerHTML = "";
  state.categories.forEach((category) => {
    refs.categoriesList.append(
      createCategoryCard(category, counts[category.id] || 0)
    );
  });
}

function renderCalendar(state) {
  refs.calendarFrom.value = state.preferences.calendarRange.from;
  refs.calendarTo.value = state.preferences.calendarRange.to;

  const ranged = filterByRange(
    state.appointments,
    state.preferences.calendarRange
  );
  const categoriesById = new Map(
    state.categories.map((category) => [category.id, category])
  );
  const enriched = ranged.map((appointment) => {
    const category = categoriesById.get(appointment.categoryId);
    return {
      ...appointment,
      categoryName: category?.name || "Uncategorized",
      categoryColor: category?.color || "gray",
    };
  });
  const groups = groupAppointmentsByDate(enriched);

  refs.calendarAgenda.innerHTML = "";
  groups.forEach((group) => {
    refs.calendarAgenda.append(createAgendaGroup(group.date, group.items));
  });

  refs.calendarEmpty.hidden = groups.length > 0;
}

function openAppointmentModal(appointment) {
  const state = getState();
  const activeFilter = state.preferences.appointmentFilters.categoryId;
  const defaults = buildDefaultAppointment(activeFilter || "general");
  const data = appointment ? { ...defaults, ...appointment } : defaults;

  refs.modalTitle.textContent = appointment
    ? "Edit appointment"
    : "New appointment";
  refs.deleteAppointmentBtn.hidden = !appointment;

  refs.appointmentId.value = appointment ? appointment.id : "";
  refs.appointmentTitle.value = data.title;
  refs.appointmentDate.value = data.date || todayISO();
  refs.appointmentStart.value = data.startTime;
  refs.appointmentEnd.value = data.endTime;
  refs.appointmentCategory.value = data.categoryId;
  refs.appointmentStatus.value = data.status || "planned";
  refs.appointmentLocation.value = data.location;
  refs.appointmentNotes.value = data.notes;

  refs.appointmentErrors.textContent = "";
  refs.modal.hidden = false;
  refs.appointmentTitle.focus();
}

function closeAppointmentModal() {
  refs.modal.hidden = true;
  refs.appointmentErrors.textContent = "";
}

function readAppointmentForm() {
  return {
    title: refs.appointmentTitle.value,
    date: refs.appointmentDate.value,
    startTime: refs.appointmentStart.value,
    endTime: refs.appointmentEnd.value,
    categoryId: refs.appointmentCategory.value,
    status: refs.appointmentStatus.value,
    location: refs.appointmentLocation.value,
    notes: refs.appointmentNotes.value,
  };
}

function renderFormErrors(errors) {
  refs.appointmentErrors.textContent = errors.join(" ");
}

function updateCategoryColorPreview(colorId) {
  const accent = CATEGORY_COLOR_IDS.includes(colorId)
    ? `var(--c-${colorId})`
    : "var(--c-gray)";
  refs.categoryColorDot.style.background = accent;
}

function showToast(message, tone) {
  const toast = document.createElement("div");
  toast.className = `toast toast-${tone || "info"}`;
  toast.textContent = message;
  refs.toastContainer.append(toast);
  window.setTimeout(() => toast.classList.add("show"), 10);
  window.setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => toast.remove());
  }, 2600);
}
