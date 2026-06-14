# Fixora Frontend — Task Board

> **Client-side only.** Backend tasks live in **FIXORAB**.  
> Update after each task: `⬜ Todo` · `🔄 In Progress` · `✅ Done` · `⏸ Blocked`  
> **Cursor and Codex:** keep this in sync with `AI_HANDOFF.md`.

**Last updated:** 2026-06-14

**Roadmap order:** Phase 0 → 1 → 2 (desktop pages) → **3 (mobile)** → 4 (migration) → 5 (light theme)

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
| P3-05 | Search + Technician Profile | ✅ Done | `/search` mockup + `/technicians/[id]` profile + book placeholder |
| P3-06 | Booking flow UI | ✅ Done | `/technicians/[id]/book` — device picker + new device form + booking details, `createDevice`/`createBooking` wired |
| P3-07 | Messages UI | ✅ Done | `/messages` — chat list + thread + request details, mockup `customer-pages-full.png` §6 |
| P3-08 | My Page + Notifications | ✅ Done | `/mypage` (profile + Requests/Following/Repair Stories/Settings tabs) + `/notifications` — mockup `customer-pages-full.png` §7–8 |
| P3-09 | Tenant Dashboard (§9.3) | ⬜ Todo | Mockup: `docs/design/technician/technician-dashboard-full.png` |
| P3-10 | Community + Post Detail | ⬜ Todo | Mockup: `customer-pages-full.png` §4–5 |

> **During Phase 2:** build **responsive-safe** (flex/grid, `@media`, both `#pc-wrap` / `#mobile-wrap`) — not full mobile polish. See `MOB-01` in `DECISIONS.md`.

---

## Phase 3 — Mobile Responsive (full conversion)

> **Goal:** Pixel-perfect mobile UX per route — after matching desktop page exists.  
> **Mockups:** Auth wireframe has mobile layouts; other pages derive from desktop mockups + breakpoints.  
> **Legacy:** `scss/mobile/main.scss` is Nestar-era — replace with Fixora tokens in PM-01.

| ID | Task | Status | Depends on | Notes |
|----|------|--------|------------|-------|
| PM-01 | Mobile foundation | ⬜ Todo | P3-02 ✅ | Breakpoints (992 / 768 / 639), `scss/mobile/` Fixora tokens, shared mixins from `scss/pc/`, safe-area vars |
| PM-02 | Global shell — navbar + footer | ⬜ Todo | PM-01, P3-04 ✅ | `Top.tsx` mobile: EN\|KR, Log in, Find Technician, bell, avatar, opaque bar, hamburger/drawer if needed |
| PM-03 | Auth mobile | ⬜ Todo | PM-02, P3-03 ✅ | Single-column per `auth-flow-wireframe.png`; upload previews, role cards, onboarding steps |
| PM-04 | Homepage mobile | ⬜ Todo | PM-02, P3-04 ✅ | Hero typography/padding, category chips, trust marquee, sections stack, testimonials 1-col |
| PM-05 | Search + Technician Profile mobile | ⬜ Todo | PM-02, P3-05 | Filters drawer, result cards, profile gallery + CTA sticky bottom |
| PM-06 | Booking flow mobile | ⬜ Todo | PM-02, P3-06 | Stepper, device form, KakaoPay CTA, deposit summary |
| PM-07 | Messages mobile | ⬜ Todo | PM-02, P3-07 | Conversation list + thread full-screen; phone hidden until ACCEPTED |
| PM-08 | My Page + Notifications mobile | ⬜ Todo | PM-02, P3-08 ✅ | Tabs, booking cards, notification list |
| PM-09 | Community + Post Detail mobile | ⬜ Todo | PM-02, P3-10 | Feed cards, article detail, comments |
| PM-10 | Technician dashboard mobile | ⬜ Todo | PM-02, P3-09 | Sidebar → drawer/bottom nav; requests/jobs cards |
| PM-11 | Admin mobile (minimal) | ⬜ Todo | PM-02, P3-15 | Read-only tables OK; verification queue usable on phone |
| PM-12 | Mobile QA pass | ⬜ Todo | PM-03–PM-11 | Touch targets ≥44px, `:active` states, no hover-only UX, landscape, iOS/Android smoke |

**Execution order:** PM-01 → PM-02 → then **PM-03 → PM-04 → … → PM-11** (same order as P3 routes).  
**Early start OK:** PM-01, PM-02, PM-03, PM-04 can begin before P3-10 — PM-05+ blocked until matching P3-xx is ✅ Done.

---

## Phase 4 — Migration & Integration

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

## Phase 5 — Light Theme & Polish

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

**Next task:** `P3-09` — Tenant Dashboard (or `PM-05` if starting mobile phase)

**Then:** `P3-09` → `P3-10` — remaining core pages

**Mobile phase:** `PM-01` after Phase 2 pages exist, or pull forward `PM-01`–`PM-04` while building P3-05+

See `AI_HANDOFF.md` for last agent and session notes.
