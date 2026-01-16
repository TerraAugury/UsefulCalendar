import { getState, updateState } from "./state.js";
import { CATEGORY_COLOR_IDS, normalizeCategoryName } from "./utils.js";

function buildCategoryId(name, existingIds) {
  const base = normalizeCategoryName(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const root = base || "category";
  let next = root;
  let count = 2;
  while (existingIds.has(next)) {
    next = `${root}-${count}`;
    count += 1;
  }
  return next;
}

export function addCategory(name, color) {
  const cleaned = normalizeCategoryName(name);
  if (!cleaned) {
    return { ok: false, error: "Category name is required." };
  }
  if (!CATEGORY_COLOR_IDS.includes(color)) {
    return { ok: false, error: "Select a valid color." };
  }
  const state = getState();
  const exists = state.categories.some(
    (category) => category.name.toLowerCase() === cleaned.toLowerCase()
  );
  if (exists) {
    return { ok: false, error: "Category already exists." };
  }
  const existingIds = new Set(state.categories.map((category) => category.id));
  const id = buildCategoryId(cleaned, existingIds);
  const newCategory = { id, name: cleaned, color };

  updateState((draft) => {
    draft.categories.push(newCategory);
  });
  return { ok: true, value: newCategory };
}

export function getCategoryById(categories, id) {
  return categories.find((category) => category.id === id) || null;
}
