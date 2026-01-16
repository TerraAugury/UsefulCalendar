VisualSpec.md
1) Design goals

Looks like a modern iOS utility app: clean, spacious, soft surfaces

Strong emphasis on readability and tap targets

Category color is used as accent, not overwhelming fill

2) Layout & grid
Breakpoints

Mobile base: 360–430px width

Tablet/Desktop: ≥ 900px

Keep bottom nav or shift to top/side (optional), but layout must remain consistent.

Page structure

header (sticky): screen title + primary action (Add)

main: content area (lists/forms)

nav (bottom): tab bar (mobile)

Spacing scale (use consistently)

--space-1: 4px

--space-2: 8px

--space-3: 12px

--space-4: 16px

--space-5: 24px

--space-6: 32px

Margins/padding

Screen padding: 16px on mobile

Card padding: 12–14px

Gap between cards: 10–12px

3) Typography

System-first stack:

font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Arial, sans-serif;

Font sizes (recommended)

Screen title: 20px (600 weight)

Section labels: 13px (600 weight, subdued)

Body: 15–16px

Secondary/meta text: 12–13px

Button text: 15px (600 weight)

Line heights

Body: 1.4–1.5

Headings: 1.2–1.3

4) Radius, borders, shadows

Radii

App cards: 14px

Inputs: 12px

Pills/chips: 999px

Bottom nav container: 18px (if floating) or 0 (if full-width bar)

Borders

Subtle 1px hairline: 1px solid var(--border)

Shadows (keep subtle)

Light mode:

0 6px 18px rgba(0,0,0,0.06)

Dark mode:

0 8px 24px rgba(0,0,0,0.35) (but use sparingly)

5) Color system (Light + Dark)

All colors must be driven by CSS variables.

Core surface variables

Define these in :root (light defaults):

--bg (app background)

--surface (card / panels)

--surface-2 (e.g. inputs, elevated areas)

--text (primary)

--text-2 (secondary)

--border

--shadow (optional)

--focus (focus outline)

--tint-alpha (tint strength for category color backgrounds)

Recommended values (iOS-like)

Light

--bg: #F2F2F7;

--surface: #FFFFFF;

--surface-2: #F7F7FA;

--text: #111111;

--text-2: #5C5C66;

--border: rgba(0,0,0,0.10);

--focus: rgba(10,132,255,0.45);

--tint-alpha: 0.16;

Dark (@media (prefers-color-scheme: dark))

--bg: #000000;

--surface: #1C1C1E;

--surface-2: #2C2C2E;

--text: #F2F2F7;

--text-2: rgba(242,242,247,0.72);

--border: rgba(255,255,255,0.12);

--focus: rgba(10,132,255,0.55);

--tint-alpha: 0.22; (slightly stronger in dark mode)

Category palette variables (system-like)

Define:

--c-blue: #0A84FF;

--c-green: #30D158;

--c-orange: #FF9F0A;

--c-red: #FF453A;

--c-purple: #BF5AF2;

--c-teal: #64D2FF;

--c-indigo: #5E5CE6;

--c-pink: #FF375F;

--c-yellow: #FFD60A;

--c-gray: #8E8E93;

6) Components
6.1 Bottom tab bar (mobile)

Fixed at bottom, full width

Height: 64px (plus safe area inset)

Background: --surface with subtle border top

Each tab item:

Icon (simple inline SVG) + label

Label size: 11–12px

Active tab:

icon + label tinted with --c-blue (or a dedicated --brand)

subtle background highlight (optional)

Safe area:

Add padding-bottom: env(safe-area-inset-bottom)

6.2 Buttons

Primary button:

Height: 44px

Radius: 12px

Background: --c-blue

Text: white

Secondary button:

Background: --surface-2

Border: --border

Text: --text

Destructive:

Text or outline red, avoid solid red fill unless confirming

6.3 Inputs

Height: 44px

Radius: 12px

Background: --surface-2

Border: --border

Focus: outline: 3px solid var(--focus); outline-offset: 2px;

6.4 Appointment card (colored by category)

Card background: --surface + optional tint

Category accent:

Left stripe: 4px wide, rounded ends

or Dot + pill at top

Tint:

Use subtle tinted background derived from --accent

Must not reduce readability (text remains --text)

Recommended structure:

Title (one line, ellipsis)

Time + location row (secondary text)

Category pill with dot (uses accent)

6.5 Category pill

Radius: 999px

Padding: 4px 10px

Dot: 8px circle

Background: tinted from accent (light tint)

6.6 Modal / Drawer (for Add/Edit)

Mobile: bottom sheet style (slides up)

Desktop: centered modal

Background overlay: semi-transparent black

Sheet radius: 16–20px

Close: “X” button + Esc support

7) Motion (optional but recommended)

Keep motion subtle and fast:

Tab transitions: 150–200ms fade/slide

Modal open/close: 180–220ms

Use CSS transitions only (no libraries)

8) States & feedback

Empty states: icon + short message + primary CTA

Inline validation: show message under input in red (small text)

Toast (optional): small message at bottom above tab bar

9) Icon style

Use minimal line icons, consistent stroke width

Inline SVG only (no icon libraries)

Size:

Tab icons: 22–24px

Action icons: 18–20px

10) “Definition of Done” visual checklist

Looks good in both light and dark

Text contrast is readable everywhere

Tap targets ≥ 44px height

Bottom nav never overlaps content (content has bottom padding)

Category colors feel consistent and not too saturated (tints are subtle)

Cards, inputs, buttons share consistent radii and spacing

Desktop doesn’t look “stretched”—content should max-width ~ 900–1100px with margins