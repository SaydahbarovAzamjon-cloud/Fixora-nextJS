# Fixora Frontend — Task Board

> **Client-side only.** Backend tasks live in **FIXORAB**.  
> Update after each task: `⬜ Todo` · `🔄 In Progress` · `✅ Done` · `⏸ Blocked`  
> **Cursor and Codex:** keep this in sync with `AI_HANDOFF.md`.

**Last updated:** 2026-06-10

---

## Phase 0 — Analysis & Docs

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P0-01 | Project analysis | ✅ Done | `FIXORA-ANALIZ.md` |
| P0-02 | ER model (reference for GraphQL types) | ✅ Done | §4.9 |
| P0-03 | Decisions log | ✅ Done | `DECISIONS.md` |
| P0-04 | Cursor + Codex handoff system | ✅ Done | `AI_HANDOFF.md`, `AGENTS.md` |
| P0-05 | Design mockups indexed | ✅ Done | `docs/design/README.md` |

---

## Phase 1 — Design System & Theme

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P3-01 | Next.js app exists | ✅ Done | `fixora-next` — Fixora branding applied |
| P3-02 | Dark/orange Fixora theme | ✅ Done | MUI `fixoraDark` + SCSS tokens |
| P3-02a | Replace legacy colors/fonts globally | ✅ Done | `--fixora-*` in `scss/variables.scss` |
| P3-02b | Dark glass card component pattern | ✅ Done | `libs/components/ui/` + `scss/fixora-ui.scss` |
| P3-02c | Light theme token placeholders | ✅ Done | CSS vars in `:root` — inactive until P4-05 |

---

## Phase 2 — Core Pages

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P3-03 | Auth flow UI | ✅ Done | `/login`, `/register`, role, tech onboarding — mockup-based |
| P3-03b | OAuth wiring (Google + Kakao) | ✅ Done | GIS `initCodeClient` + Kakao SDK → `loginWithOAuth` |
| P3-04 | Homepage | ✅ Done | Hero AI + TopTechnicians, HowItWorks, TechTips, Testimonials per mockup |
| P3-05 | Search + Technician Profile | ⬜ Todo | Mockup: `docs/design/customer/customer-pages-full.png` §2–3 |
| P3-06 | Booking flow UI | ⬜ Todo | No mockup yet — follow `FIXORA-ANALIZ.md` §9.2 |
| P3-07 | Messages UI | ⬜ Todo | Mockup: `customer-pages-full.png` §6 |
| P3-08 | My Page + Notifications | ⬜ Todo | Mockup: `customer-pages-full.png` §7–8 |
| P3-09 | Tenant Dashboard (§9.3) | ⬜ Todo | Mockup: `docs/design/technician/technician-dashboard-full.png` |
| P3-10 | Community + Post Detail | ⬜ Todo | Mockup: `customer-pages-full.png` §4–5 |

---

## Phase 3 — Migration & Integration

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P3-11 | Rename UI copy: Property → Device | ⬜ Todo | Labels, routes, components |
| P3-12 | Rename UI copy: Agent → Technician | ⬜ Todo | Labels, routes, components |
| P3-13 | Update Apollo queries for Fixora schema | 🔄 In Progress | FIXORAB MVP ready — `docs/FRONTEND_API.md`, `docs/schema.gql` synced |
| P3-14 | ON_SITE "Coming Soon" UI | ⬜ Todo | Badge only — no flow |
| P3-15 | Admin UI (incremental) | ⬜ Todo | No mockup — see `docs/design/admin/README.md` |
| P3-15a | Admin shell (light, Fixora orange) | ⬜ Todo | Adapt `LayoutAdmin` — part of P3-15 |
| P3-15b | Technician verification queue | ⬜ Todo | After P3-09 — required for onboarding flow |
| P3-15c | Users + Bookings lists | ⬜ Todo | When FIXORAB admin APIs ready |
| P3-15d | Community moderation | ⬜ Todo | After P3-10 |

---

## Phase 4 — Light Theme & Polish

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P4-01 | AI classification display on booking form | ⬜ Todo | Optional UI hint |
| P4-02 | Technician matching UI | ⬜ Todo | Search recommendations |
| P4-03 | Technician analytics charts | ⬜ Todo | Tenant dashboard |
| P4-04 | E2E / component tests for Fixora flows | ⬜ Todo | |
| P4-05 | Light theme tokens | ⬜ Todo | No mockup yet — derive from dark tokens |
| P4-06 | Light pages rollout | ⬜ Todo | Auth + core pages |
| P4-07 | Theme toggle (Settings) | ⬜ Todo | My Page + Tech Settings |

---

## Out of Scope Here (FIXORAB Backend)

Backend work (DeviceModule, BookingModule, KakaoPay server, etc.) is tracked in the **FIXORAB** repo — not in this task board.

---

## Current Focus

**Next task:** `P3-05` — Search + Technician Profile

**Then:** `P3-06` — Booking flow UI

See `AI_HANDOFF.md` for last agent and session notes.
