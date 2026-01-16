# Agents.md — Appointment Notebook WebApp (HTML + CSS + Vanilla JS)

## 1) Mission
Build a mobile-first WebApp that lets users store and manage appointments like a notebook.
The app must work well on both mobile and desktop and persist data locally (no backend).

## 2) Non-Negotiables (Hard Constraints)
- Use ONLY: HTML, CSS, Vanilla JavaScript
- No frameworks, no build tools, no bundlers, no TypeScript.
- No external dependencies/CDNs unless explicitly approved later.
- Data persistence must be local:
  - Start with localStorage.
- Must be responsive and touch-friendly (mobile-first).
- Code MUST be broken into multiple files/modules for maintainability (no giant single-file app).

## 3) Navigation / Tabs (Mobile Bottom Menu)
- Persistent bottom navigation with 4 tabs:
  1) Appointments
  2) Calendar
  3) Categories
  4) Settings
- Each tab is a <section> screen; only one visible at a time.
- Tab switching must not unexpectedly clear user input.
- Recommended: sync active tab with URL hash (#appointments, #calendar, etc.).
- On wider screens (>= 900px), nav may remain bottom or adapt to top/side via CSS.

## 4) Category Colors (iOS-consistent palette)
### 4.1 Requirements
- Users can add categories AND choose a color for each category.
- Each appointment is colored based on its category color.
- Color approach should be consistent with iOS patterns:
  - Use a limited “system-like” palette (no arbitrary color picker).
  - Appointments should show a subtle tinted background + a strong accent indicator
    (e.g., left stripe or dot), not full saturated blocks.

### 4.2 Allowed Color IDs
Use a fixed palette with these IDs:
- blue, green, orange, red, purple, teal, indigo, pink, yellow, gray

### 4.3 CSS Variables Contract
Define these CSS variables in styles.css:
- --c-blue, --c-green, --c-orange, --c-red, --c-purple, --c-teal, --c-indigo, --c-pink, --c-yellow, --c-gray
Also define tint strength variable(s) for light/dark.

Appointments MUST be styled by setting a per-card CSS custom property:
- --accent: var(--c-<colorId>)

UI should render:
- left stripe (or dot) using --accent
- soft tint background derived from --accent (prefer color-mix; if unsupported, fallback gracefully)

## 5) Feature Scope (What to Build)
### MVP (must implement)
Appointments:
- Create / Edit / Delete appointments.
- Fields:
  - title (required)
  - date (required, YYYY-MM-DD)
  - startTime (required, HH:MM)
  - endTime (optional)
  - categoryId (required)
  - location (optional)
  - notes (optional)
  - status (planned / done / cancelled)
- Display as tappable cards; tap/click opens edit.
- Empty state when none exist.

Filtering + Sorting:
- Search across title/location/notes
- Category filter (by categoryId)
- Date range (from/to)
- Sort:
  - date/time asc
  - date/time desc
  - category
  - createdAt

Categories:
- Categories screen:
  - Add category (name + choose from palette color IDs)
  - List categories with color preview
  - (Nice-to-have later) rename/delete with safeguards

Calendar (MVP):
- Agenda view grouped by date (not a month grid yet).
- Ability to choose a date or range then show grouped appointments.

Settings:
- Export JSON (versioned, includes categories + appointments)
- Import JSON:
  - validate schema + formats
  - confirm overwrite
  - if invalid, show error and do nothing
- Reset/Clear all data with confirmation

## 6) Data Model (Source of Truth)
### Categories (v2)
Categories are objects (NOT strings):

```js
{
  id: "cat_xxx",
  name: "Doctors",
  color: "red" // one of the allowed color IDs
}
Store categories as an array:

[
  { id:"general", name:"General", color:"blue" },
  { id:"doctors", name:"Doctors", color:"red" }
]

Appointments (v2)

Appointments reference category by categoryId:

{
  id: "uuid",
  title: "Dentist",
  date: "2026-01-16",
  startTime: "14:30",
  endTime: "15:00",
  categoryId: "doctors",
  location: "City Clinic",
  notes: "",
  status: "planned",
  createdAt: 1700000000000,
  updatedAt: 1700000000000
}

7) Persistence / Storage Keys (Versioned)

Use versioned keys:

app_appointments_v2

app_categories_v2

app_preferences_v1 (optional: activeTab, default sort, etc.)

Migration

If v1 keys exist (string categories / appointment.category string), migrate to v2:

Build category objects from old strings, assign colors deterministically from palette
(e.g., hash name -> palette index) so results are stable.

Convert appointment.category -> appointment.categoryId via name lookup.

Never silently delete user data during migration. If migration fails, keep old data and show an error.

8) Required Code Organization (Maintainability First)

MANDATORY structure (create these files; keep responsibilities focused):

/app
index.html
styles.css
main.js # bootstrap, init, render loop wiring
state.js # state + state update helpers (single source of truth)
storage.js # localStorage load/save, migration, import/export, validation
router.js # bottom tabs + hash sync
ui.js # screen rendering + DOM event wiring (delegation)
components.js # reusable DOM builders (cards, pills, inputs, modal)
appointments.js # appointment CRUD + filter + sort logic
categories.js # category CRUD (at least add) + palette helpers
calendar.js # agenda grouped-by-date logic
settings.js # import/export/reset + preferences
utils.js # uuid, debounce, date/time, validation, hash helpers

Rules:

No circular deps.

Use ES modules (<script type="module" src="./main.js"></script>).

State lives in state.js. UI reads state, actions mutate state via state helpers, then rerender.

DOM querying should be centralized (ui.js/components.js), not scattered everywhere.

9) Validation Rules

Appointment:

title non-empty

date valid

startTime valid

if endTime exists: endTime >= startTime

categoryId must exist; fallback to "general" if missing

Category:

name non-empty and unique (case-insensitive preferred)

color must be one of allowed IDs

10) Import / Export Rules

Export JSON format (example):

{
  version: 2,
  exportedAt: 1700000000000,
  categories: [...],
  appointments: [...]
}


Import:

Validate schema and fields

Confirm overwrite

On success: replace current storage + state + rerender

On failure: show error and keep current data

11) Testing Checklist (Manual)

CRUD persists after refresh

Category colors show correctly on appointment cards

Filters + sorts combine correctly

Bottom nav works on mobile; desktop responsive ok

Keyboard navigation + labels ok

Import/export round-trip works

Migration: if v1 data exists, it migrates without loss

12) Work Plan (Execution Order)

Scaffold UI: bottom tabs + screens + basic styling + CSS color variables

Implement router.js tab switching + (optional) hash sync

Implement state.js + storage.js (load/save + default categories + migration)

Implement Appointments CRUD + colored cards (stripe + tint)

Implement filters + sorting

Implement Categories screen (add category with color selection)

Implement Calendar agenda grouped by date

Implement Settings export/import/reset

Polish accessibility + responsiveness + error states