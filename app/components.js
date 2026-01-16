import { formatDateLabel } from "./utils.js";

export function createAppointmentCard(appointment, category) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "card appointment-card";
  card.dataset.id = appointment.id;
  const accentColor = category?.color ? `var(--c-${category.color})` : "var(--c-gray)";
  card.style.setProperty("--accent", accentColor);

  const stripe = document.createElement("span");
  stripe.className = "accent-strip";
  stripe.setAttribute("aria-hidden", "true");

  const content = document.createElement("div");
  content.className = "card-content";

  const title = document.createElement("h3");
  title.textContent = appointment.title;

  const status = document.createElement("span");
  status.className = "status-pill";
  status.textContent = appointment.status;

  const header = document.createElement("div");
  header.className = "card-header";
  header.append(title, status);

  const meta = document.createElement("p");
  meta.className = "card-meta";
  const timeBlock = appointment.endTime
    ? `${appointment.startTime}-${appointment.endTime}`
    : appointment.startTime;
  meta.textContent = appointment.location
    ? `${appointment.date} ${timeBlock} - ${appointment.location}`
    : `${appointment.date} ${timeBlock}`;

  const notes = document.createElement("p");
  notes.className = "card-notes";
  notes.textContent = appointment.notes || "";
  if (!appointment.notes) {
    notes.hidden = true;
  }

  const footer = document.createElement("div");
  footer.className = "card-footer";

  const pill = document.createElement("span");
  pill.className = "category-pill";

  const dot = document.createElement("span");
  dot.className = "pill-dot";
  dot.setAttribute("aria-hidden", "true");

  const name = document.createElement("span");
  name.textContent = category?.name || "Uncategorized";

  pill.append(dot, name);
  footer.append(pill);

  content.append(header, meta, notes, footer);
  card.append(stripe, content);
  return card;
}

export function createCategoryCard(category, count) {
  const card = document.createElement("div");
  card.className = "card category-card";
  const accentColor = category?.color ? `var(--c-${category.color})` : "var(--c-gray)";
  card.style.setProperty("--accent", accentColor);

  const row = document.createElement("div");
  row.className = "category-row";

  const dot = document.createElement("span");
  dot.className = "pill-dot";
  dot.setAttribute("aria-hidden", "true");

  const title = document.createElement("h3");
  title.textContent = category.name;
  row.append(dot, title);

  const meta = document.createElement("p");
  meta.className = "card-meta";
  meta.textContent = `${count} appointment${count === 1 ? "" : "s"}`;

  card.append(row, meta);
  return card;
}

export function createAgendaGroup(date, items) {
  const group = document.createElement("div");
  group.className = "agenda-group";

  const title = document.createElement("h3");
  title.textContent = formatDateLabel(date);
  group.append(title);

  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "agenda-item";
    const accentColor = item.categoryColor
      ? `var(--c-${item.categoryColor})`
      : "var(--c-gray)";
    row.style.setProperty("--accent", accentColor);

    const left = document.createElement("span");
    left.textContent = `${item.startTime}${
      item.endTime ? `-${item.endTime}` : ""
    }`;

    const right = document.createElement("span");
    right.textContent = `${item.title} - ${item.categoryName}`;

    row.append(left, right);
    group.append(row);
  });

  return group;
}

export function buildOptions(options, { includeAll } = {}) {
  const fragment = document.createDocumentFragment();
  if (includeAll) {
    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "All categories";
    fragment.append(allOption);
  }
  options.forEach((optionValue) => {
    const option = document.createElement("option");
    if (typeof optionValue === "string") {
      option.value = optionValue;
      option.textContent = optionValue;
    } else {
      option.value = optionValue.value;
      option.textContent = optionValue.label;
    }
    fragment.append(option);
  });
  return fragment;
}
