# AIowuka Visual Direction

Status: **FROZEN BASELINE — 2026-09-08**

This document is the visual authority for the personal site redesign. It is intentionally separate from Auth/RLS architecture.

## Design intent

The site should feel like **a person's desk, notebook, photo album, and current-life index**, not a company homepage, startup landing page, or institutional portfolio.

Primary emotional qualities:

- personal
- curious
- warm
- handmade
- quiet but not sterile
- technical without looking like a tech company
- able to contain research, projects, photos, music, notes, and private sharing in one world

## Source design skills

Direction is informed by the public `bergside/awesome-design-skills` registry:

- **Doodle** — hand-drawn / sketch-like / imperfect personal marks
- **Cafe** — warm, relaxed, soft browsing atmosphere
- **Dithered** — used only as a light digital texture, never as the dominant aesthetic

Do not treat any source skill as a drop-in theme. AIowuka's site uses a custom blend.

## Visual hierarchy

### 1. Personal first

Every page should answer “whose space is this?” before “what product is this?”.

Prefer:
- handwritten notes
- location / current-life fragments
- personal photos
- small status lists
- imperfect alignment used deliberately
- small English labels beside Chinese content

Avoid:
- corporate hero statements
- marketing CTAs
- product benefit grids
- feature-card walls
- institutional navigation taxonomies

### 2. Layout

Desktop may use a left personal rail and a broad working canvas.

The canvas can mix:
- one dominant photo or visual
- handwritten statement
- pinned paper note
- 2–4 small content shelves
- one dark strip for contrast

Asymmetry is allowed. Randomness is not.

### 3. Color

Core palette:

- paper: `#F4EFE5`
- paper secondary: `#EBE4D8`
- ink: `#181815`
- soft ink: `#5D584F`
- muted: `#8B8479`
- line: `#D5CEC1`
- peach: `#E9A18A`
- orange accent: `#D96945`
- night: `#1E1E1A`

No default “tech blue”. Strong saturated colors should be rare and image-led.

### 4. Typography

Chinese expressive text may use local handwriting / Kai-style fallbacks:

`STKaiti`, `KaiTi`, `Segoe Print`, cursive

UI/body text stays readable system sans-serif.

Tiny labels/status/tags use monospace.

Do not make all text handwritten. Handwriting is an accent layer, not the body system.

### 5. Surfaces

Use thin rules and paper separation before cards.

Preferred:
- 1px rules
- paper sheets
- restrained shadows for pinned notes only
- little or no border radius
- subtle paper grain

Avoid:
- glassmorphism
- floating dashboard cards
- heavy shadows everywhere
- large rounded rectangles
- gradients that read as SaaS branding

### 6. Imagery

Real personal photos are the preferred final media source.

Until real photos are supplied, abstract or CSS placeholders may be used, but they must be easy to replace.

Image categories expected later:
- city / campus / travel
- UAV / robotics / hardware
- desk / code / research
- music / headphones / records
- daily-life moments

### 7. Motion

Motion must be small and purposeful:
- 1–3 px translation
- underline / color changes
- gentle paper response

No parallax spectacle, particle fields, glowing cursors, or decorative 3D.

Respect `prefers-reduced-motion`.

### 8. Authenticated areas

Login / Private / Admin belong to the same visual world, but must remain function-first.

Do not compromise:
- authentication clarity
- authorization state visibility
- form readability
- error states
- accessibility

Auth/RLS semantics are frozen independently and must not be changed as part of visual redesign.

## Prohibited drift

Do **not** redesign this site into:

- a company homepage
- an AI startup website
- a portfolio template full of project cards
- a dark cyberpunk interface
- a blue/white technology dashboard
- an Apple clone
- a Notion clone
- a generic developer landing page

## Current implementation target

Public homepage:

`personal rail + dominant visual + handwritten intro + current-doing note + research/projects/photos/music shelf + dark notebook strip + private portal entrance`

Private portal:

`quiet reading room / personal library`

Admin:

`paper-based work surface; function first`

## QA question

Before merging any visual change, ask:

> Does this look like a specific person's evolving corner of the internet, or could it belong to any company/template?

If the answer is “any company/template”, reject the change.
