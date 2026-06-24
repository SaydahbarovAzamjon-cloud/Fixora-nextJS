# Fixora Frontend — Task Board

> **Client-side only.** Backend tasks live in **FIXORAB**.  
> Update after each task: `⬜ Todo` · `🔄 In Progress` · `✅ Done` · `⏸ Blocked`  
> **Cursor and Codex:** keep this in sync with `AI_HANDOFF.md`.

**Last updated:** 2026-06-24

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
| PM-01 | Mobile foundation | ✅ Done | Breakpoints 992/768/639 in `scss/variables.scss`; `scss/mobile/_breakpoints.scss`, `_mixins.scss`, `_foundation.scss`, `_footer.scss`; Nestar legacy removed from `main.scss` |
| PM-02 | Global shell — navbar + footer | ✅ Done | `Top.tsx` hamburger drawer; EN\|KR, Log in, Find Technician (guest); bell/chat/avatar (auth); `scss/mobile/_navbar.scss` |
| PM-03 | Auth mobile | ✅ Done | `scss/mobile/_auth.scss`; upload image previews in tech onboarding/id |
| PM-04 | Homepage mobile | ✅ Done | `scss/mobile/_homepage.scss` — hero, sections, testimonials, stories |
| PM-05 | Search + Technician Profile mobile | ✅ Done | Filter drawer on `/search`; sticky book CTA on profile; `scss/mobile/_search.scss` |
| PM-06 | Booking flow mobile | ✅ Done | `scss/mobile/_booking.scss` — touch targets, single-column forms |
| PM-07 | Messages mobile | ✅ Done | Full-screen list/thread toggle; back button; `scss/mobile/_messages.scss` |
| PM-08 | My Page + Notifications mobile | ✅ Done | `scss/mobile/_mypage.scss` — scrollable tabs, booking cards |
| PM-09 | Community + Post Detail mobile | ✅ Done | `scss/mobile/_community.scss` — feed cards, post detail |
| PM-10 | Technician dashboard mobile | ✅ Done | `TechnicianMobileBottomNav` + header; `scss/mobile/_technician.scss` incl. `/technician/messages` list/thread toggle |
| PM-11 | Admin mobile (minimal) | ✅ Done | `scss/mobile/_admin.scss` — table scroll, touch targets |
| PM-12 | Mobile QA pass | ✅ Done | `scss/mobile/_qa.scss` — touch/active, landscape, iOS input zoom fix; viewport `matchMedia` hook + `_document` bootstrap |

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
| P3-15e | Admin design system parity | ✅ Done | Customer burgundy tokens + card surfaces across all `/_admin/*`; GAP-078 notifications |
| P3-16 | Admin user management rework | ✅ Done | `/_admin/users/[id]` privileged dashboard; row actions; badges; GAP-101…109 |
| P3-16a | Route + list actions + badges | ✅ Done | `AdminUserActionsMenu`, `AdminUserBadgeStack` |
| P3-16b | User detail shell + wired sections | ✅ Done | Overview, Performance, Financial, Content, Verification |
| P3-16c | Action modals + deep links | ✅ Done | Suspend/activate/delete; bookings/payments `?userId=` |
| P3-16d | GAP docs + badge parity | ✅ Done | Verification queue + dashboard widgets |

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

**Next task:** **P3-13** Apollo migration (remaining) OR **Phase 5** polish — **Phase 3 mobile PM-01…PM-12 ✅** · **production build ✅**

**Backend wiring:** Phase 0–4 ✅ — `docs/FIXORAF_SYNC.md`

**Desktop gap checklist (Phase 2):** P3-14 ✅ · P3-07b ✅ · Backend gaps wired ✅ · **Phase 3 mobile PM-01…PM-12 ✅**

See `AI_HANDOFF.md` for last agent and session notes.
