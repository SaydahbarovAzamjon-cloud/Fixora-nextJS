# Fixora Frontend — Task Board

> **Client-side only.** Backend tasks live in **FIXORAB**.  
> Update after each task: `⬜ Todo` · `🔄 In Progress` · `✅ Done` · `⏸ Blocked`  
> **Cursor and Codex:** keep this in sync with `AI_HANDOFF.md`.

**Last updated:** 2026-06-21

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
| P3-05 | Search + Technician Profile | ✅ Done | `/search` + `/technicians/[id]` + **`/technicians`** directory (stats, top/new, filters) |
| P3-06 | Booking flow UI | ✅ Done | `/technicians/[id]/book` — device picker + `createDevice`/`createBooking` |
| P3-06b | Deposit payment UI (KakaoPay mock) | ✅ Done | `DepositPaymentCard`, `useDepositPayment`, booking post-step + My Page Pay Deposit — `initiatePayment`/`confirmPayment` (PAY-05) |
| P3-07 | Messages UI | ✅ Done | `/messages` — chat list + thread + request details, mockup `customer-pages-full.png` §6 |
| P3-07b | Messages WebSocket (realtime) | ✅ Done | Dedicated auth WS in `fixoraWebSocket.ts`; `FixoraWebSocketBridge` refetch; adaptive `useRealtimePollInterval` (0 when connected, fallback when offline). Backend emit still GAP-062. |
| P3-08 | My Page + Notifications | ✅ Done | `/client/my-page` (6-tab owner view) + `/mypage` redirect + `/notifications` — real API; GAP-098 saved technicians |
| P3-08b | Booking detail + final payment | ✅ Done | `/mypage/bookings/[id]` — detail view, deposit + final mock payment, cancel, review; wired from Messages/My Page/notifications |
| P3-09 | Tenant Dashboard (§9.3) | ✅ Done | 8 screens incl. Settings 1:1 (`libs/components/technician/settings/`); Profile/Account/Security/Availability GraphQL; GAP-090…096 in BACKEND_SETTINGS.md |
| P3-10 | Community + Post Detail | ✅ Done | `/community` feed + `/community/[id]` detail + `/community/write`; 4 components; 6 GraphQL ops; route migration from `?id=` to `[id]` |

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
| P3-11 | Rename UI copy: Property → Device | ✅ Done | Legacy `common.json` keys retargeted; MVP routes already Fixora-branded |
| P3-12 | Rename UI copy: Agent → Technician | ✅ Done | Same i18n pass (`Agents` → Technicians, etc.) |
| P3-13 | Update Apollo queries for Fixora schema | 🔄 In Progress | MVP: `likeTargetUser` on search/technicians; `getUserFollowers` on tech notifications; duplicate Apollo WS removed. Legacy routes unchanged. |
| P3-14 | ON_SITE "Coming Soon" UI | ✅ Done | `BookingServiceTypeOptions` on profile + booking form; ON_SITE disabled badge (BIZ-01) |
| P3-15 | Admin UI (incremental) | ✅ Done | Reference screenshots + burgundy theme; see `/_admin/*` |
| P3-15a | Admin shell + menu | ✅ Done | `AdminLayout`, `AdminSidebar`, `AdminHeader` |
| P3-15b | Technician verification queue | ✅ Done | `/_admin/verification` — GAP-074 for extra filters |
| P3-15c | Users + Bookings lists | ✅ Done | `/_admin/users`, `/_admin/bookings` |
| P3-15d | Community moderation | ✅ Done | `/_admin/moderation` — GAP-075 for comments tab |

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

**Next task:** **PM-01** mobile foundation OR desktop QA pass (FixoraB API required)

**Backend wiring:** Phase 0–4 ✅ — `docs/FIXORAF_SYNC.md`

**Desktop gap checklist (Phase 2):** P3-14 ✅ · P3-07b ✅ · Backend gaps wired ✅ · **PM-01+ deferred** until user approves mobile phase

See `AI_HANDOFF.md` for last agent and session notes.
