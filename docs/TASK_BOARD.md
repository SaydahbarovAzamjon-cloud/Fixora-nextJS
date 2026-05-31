# Fixora Frontend — Task Board

> **Client-side only.** Backend tasks live in **FIXORAB**.  
> Update after each task: `⬜ Todo` · `🔄 In Progress` · `✅ Done` · `⏸ Blocked`  
> **Cursor and Codex:** keep this in sync with `AI_HANDOFF.md`.

**Last updated:** 2026-05-31

---

## Phase 0 — Analysis & Docs

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P0-01 | Project analysis | ✅ Done | `FIXORA-ANALIZ.md` |
| P0-02 | ER model (reference for GraphQL types) | ✅ Done | §4.9 |
| P0-03 | Decisions log | ✅ Done | `DECISIONS.md` |
| P0-04 | Cursor + Codex handoff system | ✅ Done | `AI_HANDOFF.md`, `AGENTS.md` |

---

## Phase 1 — Design System & Theme

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P3-01 | Next.js app exists | ✅ Done | `nestar-next` base — rename branding later |
| P3-02 | Dark/orange Fixora theme | ⬜ Todo | MUI theme + SCSS variables — **current focus** |
| P3-02a | Replace nestar colors/fonts globally | ⬜ Todo | Part of P3-02 |
| P3-02b | Dark glass card component pattern | ⬜ Todo | Part of P3-02 |

---

## Phase 2 — Core Pages

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P3-03 | Auth flow UI (§9.1) | ⬜ Todo | Login, Sign Up, Role, Tech onboarding |
| P3-04 | Homepage | ⬜ Todo | Pixel-perfect — Hero, Top Technicians, etc. |
| P3-05 | Search + Technician Profile | ⬜ Todo | Replace agent/property search |
| P3-06 | Booking flow UI | ⬜ Todo | Create request, status, KakaoPay |
| P3-07 | Messages UI | ⬜ Todo | Booking-scoped chat + sidebar |
| P3-08 | My Page + Notifications | ⬜ Todo | Customer side |
| P3-09 | Tenant Dashboard (§9.3) | ⬜ Todo | 7 screens + sidebar |
| P3-10 | Community + Post Detail | ⬜ Todo | Adapt existing community module |

---

## Phase 3 — Migration & Integration

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P3-11 | Rename UI copy: Property → Device | ⬜ Todo | Labels, routes, components |
| P3-12 | Rename UI copy: Agent → Technician | ⬜ Todo | Labels, routes, components |
| P3-13 | Update Apollo queries for Fixora schema | ⬜ Todo | When FIXORAB APIs ready |
| P3-14 | ON_SITE "Coming Soon" UI | ⬜ Todo | Badge only — no flow |
| P3-15 | Admin UI (incremental) | ⬜ Todo | No mockup yet — build as needed |

---

## Phase 4 — Polish (Later)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P4-01 | AI classification display on booking form | ⬜ Todo | Optional UI hint |
| P4-02 | Technician matching UI | ⬜ Todo | Search recommendations |
| P4-03 | Technician analytics charts | ⬜ Todo | Tenant dashboard |
| P4-04 | E2E / component tests for Fixora flows | ⬜ Todo | |

---

## Out of Scope Here (FIXORAB Backend)

Backend work (DeviceModule, BookingModule, KakaoPay server, etc.) is tracked in the **FIXORAB** repo — not in this task board.

---

## Current Focus

**Next task:** `P3-02` — Design system + dark/orange Fixora theme

See `AI_HANDOFF.md` for last agent and session notes.
