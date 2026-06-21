# Fixora — Approved Decisions

> **Do not contradict these.** Update this file only when the user explicitly approves a change.  
> **Repo:** FixoraF (frontend). Shared by **Cursor** and **Codex** — same rules apply.  
> Backend implementation of these decisions lives in **FIXORAB**.

**Last updated:** 2026-06-18

---

## ER Model

| ID | Decision |
|----|----------|
| ER-01 | **§4.9 corrected ER** in `FIXORA-ANALIZ.md` is the official schema (12 entities) |
| ER-02 | Add `technicianId` + `progressUpdates[]` + `aiClassification` on `booking` |
| ER-03 | Replace single `reviewRating` with `repairQuality`, `repairSpeed`, `communication` |
| ER-04 | Technician data **embedded on `user`** — no separate `technicianProfile` collection (MVP) |
| ER-05 | `message.bookingId` is **nullable** for pre-booking chat — no `conversation` entity |
| ER-06 | Remove `userId` from `following` — only `followerId` + `followingId` |
| ER-07 | Add `referenceId` + `referenceType` on `notification` |
| ER-08 | Add `paymentType` (DEPOSIT \| FINAL) + `transactionId` on `payment` |
| ER-09 | Remove `Property` and `Notice` from codebase — not in ER |

---

## Auth

> **Authority:** `docs/schema.gql` (`AuthProvider` enum), `docs/AUTH_API.md`, FixoraB `apps/fixora-api`.  
> Login mockup uses **email** field (high-fidelity PNG) — not phone.

| ID | Decision |
|----|----------|
| AUTH-01 | MVP providers: **`EMAIL`**, **`KAKAO`**, **`GOOGLE`** — `login`, `signup`, `loginWithOAuth` (see `schema.gql`) |
| AUTH-02 | **`APPLE`** — in schema; frontend **Coming Soon** only until configured (backend may return `APPLE_LOGIN_COMING_SOON`) |
| AUTH-03 | Login via **`userEmail` + `userPassword`** (EMAIL accounts), or OAuth via `loginWithOAuth` (KAKAO / GOOGLE authorization code or token) |
| AUTH-04 | Sign-up flow: Choose Role → Customer (immediate access) or Technician (6-step onboarding); OAuth stubs → `completeOAuthSignup` |
| AUTH-05 | Technician verification: `verificationStatus` PENDING → UNDER_REVIEW → APPROVED |
| AUTH-06 | Badges: `NEW` → `VERIFIED` (admin approve) → `PREMIUM_PRO` (future) |
| AUTH-07 | **`userPhoneNumber`** — required at signup as **KR contact only**; **never** a login field. Phone/SMS/OTP login **not supported** (`AuthProvider.PHONE` not in schema). Hide phone in chat until booking **ACCEPTED** (BIZ-04) |

---

## Business

| ID | Decision |
|----|----------|
| BIZ-01 | MVP service: **SHOP_VISIT only** — ON_SITE shows "Coming Soon" |
| BIZ-02 | Booking statuses: 6 only (see AGENTS.md) |
| BIZ-03 | Payment: 50% deposit + 50% final via KakaoPay |
| BIZ-04 | Phone visible only after booking **ACCEPTED** |
| BIZ-05 | Reviews only on **COMPLETED** bookings — one review per booking |
| BIZ-06 | AI classification optional on `booking` — never blocks booking creation |
| BIZ-07 | AI assists only — never auto-accepts bookings or assigns technicians |

---

## UI

| ID | Decision |
|----|----------|
| UI-01 | All shared mockups are **final** — pixel-perfect, no redesign |
| UI-02 | Auth wireframe (§9.1): split-screen desktop, role selection, tech onboarding |
| UI-03 | Customer pages + Homepage mockups confirmed final |
| UI-04 | Tenant (Technician) Dashboard mockup confirmed final |
| UI-05 | Admin UI — **not designed yet** — build during frontend phase |
| UI-06 | Theme: dark, **burgundy-red primary** (`#730C1E`) on customer-facing UI; **technician portal** (`/technician/*`) retains orange primary until dedicated redesign; dark glass cards |
| UI-07 | Technician **Public Profile** (`/technician/profile`) wired to live data via `getUser(user._id)` — header (name, avatar, specialty, location, rating, reviews, completed jobs, online dot) + About (`userBio`). Each field **falls back to the existing mock value** when empty, so the mockup look is preserved 100%. Profile image: show `userProfileImage` if present, else initials fallback avatar. |
| UI-08 | Public Profile **My Articles** section (after About) **reuses the Home `TechTipCard`** component and `fixora-home-tips__grid` layout — no new card style. Data from `getMyArticles` (current technician only). Empty state = premium `.fixora-pp-empty` card ("No Articles Yet"). |
| UI-09 | Public Profile fully wired to live data: **Services** (`getUser.services`, Book Now → `/technicians/[id]/book`), **Portfolio** (`getUser.portfolioImages`), **Reviews** (`getTechnicianReviews` + distribution; stars = avg of repairQuality/repairSpeed/communication), **Followers** (`getUserFollowers` list + count). Every tab/section has a `.fixora-pp-empty` empty state. Header buttons functional: **Message Me** → `/technician/messages`, **View Live Profile** → opens `/technicians/[id]`, **Follow/Following** → `subscribe`/`unsubscribe` + refetch. **Followers & Reviews counts use the real `metaCounter[0].total` from the list queries — NOT `User.followersCount`/`User.reviewCount`, which are seeded/stale and mismatched the actual records.** Other stats (rating/completed) from `getUser`, fall back to **0** when empty. **Response time has no backend field** → static `<15m`. |
| UI-11 | **Technician Dashboard (`/technician/dashboard`) interactions wired.** Quick actions: **New Quote** → `/community/write`, **Mark Available** → `updateUser({ isOnline })` toggle (real, label reflects state) + refetch, **View Schedule** → smooth-scroll to Today's Schedule card, **Export Report** → `/technician/earnings`. **Weekly Earnings chart** Week/Month/Year toggle now functional with real `getTechnicianBookings` completed earnings (week=Mon–Sun days, month=last 4 weeks, year=12 months); default period auto-selects the smallest range that has data so the line is never falsely empty; displayed amount = selected-period total. **Today's Schedule** gets an **Add** button → `AddScheduleModal` (time/task/client); items saved to **localStorage** (`fixora_tech_schedule_<userId>`) — **no backend schedule model exists**, so it is device-only — merged with booking-derived items, sorted, custom items deletable. New: `libs/components/technician/AddScheduleModal.tsx`. **Chart render fix:** the Weekly Earnings line was invisible because **recharts v3 `ResponsiveContainer` measured 0 width inside the CSS-grid card** (grid items default `min-width:auto`). Fixed with `min-width: 0` on `.fixora-tech-card` + explicit wrapper width/height + `minWidth={0}` on the container + precomputed numeric YAxis `domain` (no function form). |
| UI-10 | **Repair Stories wired to real backend** (`docs/STORY_CREATE_FRONTEND.md` + `schema.gql` synced 2026-06-17). Display: `getTechnicianStories({ technicianId, limit })` → circular cover images in the existing `.fixora-pp-story` ring (caption or date as label); hardcoded stories removed. Create: gated **"Add Story"** (only `userType==='TECHNICIAN' && verificationStatus==='APPROVED'`) opens `CreateStoryModal` → two-step `imagesUploader(target:"story")` (multipart axios, same pattern as `AddNewProperty.tsx`) then `createStory({ images:[{url,order}], caption })`, 1–5 PNG/JPG + caption ≤200, then refetch. Covers prefixed with `REACT_APP_API_URL`. New: `apollo/user/story.ts`, `libs/components/technician/CreateStoryModal.tsx`, `Story`/`CreateStoryInput` types, `verificationStatus`/`userType` added to `GET_USER`. |
| UI-12 | **i18n mandatory (EN + KR):** All user-facing UI copy uses `next-i18next` — no hardcoded strings. Locales: `public/locales/en/` + `public/locales/kr/` (code **`kr`**, not `ko`). Namespaces: `common`, `auth`, `technician`. Technician pages load via `technicianPageProps()`. New UI work must add both locale files before Done. |

---

## Maps (Kakao)

| ID | Decision |
|----|----------|
| MAP-01 | Search LocationCard uses **Kakao Maps JS SDK** (`NEXT_PUBLIC_KAKAO_JS_KEY`); user GPS + reverse geocode; technician pins from `shopLatitude` / `shopLongitude` on `User`; geo filter via `TISearch.latitude`, `longitude`, `radiusKm` (default 10 km) |

---

## Architecture

| ID | Decision |
|----|----------|
| ARCH-01 | Monorepo: `fixora-api`, `fixora-batch`, `fixora-web` (target names) |
| ARCH-02 | GraphQL-first, feature-based NestJS modules |
| ARCH-03 | MongoDB + Mongoose — follow ER strictly |
| ARCH-04 | WebSocket for real-time chat — booking-scoped, DB-persisted messages |
| ARCH-05 | Reuse nestar: auth guards, follow, like, comment, view, GraphQL infra (~40%) |

---

## Mobile Responsive

| ID | Decision |
|----|----------|
| MOB-01 | **Two-step strategy:** Phase 2 builds desktop-first pages **responsive-safe** (`@media`, flex/grid, both wraps). **Phase 3 (PM-xx)** is dedicated full mobile polish — not deferred to light theme. |
| MOB-02 | **Task order:** `PM-01` foundation → `PM-02` global navbar/footer → `PM-03`…`PM-11` mirror P3 route order. `PM-05+` starts only after matching `P3-xx` is ✅ Done. |
| MOB-03 | **Breakpoints:** 992px (tablet), 768px (small tablet), 639px (phone). Prefer CSS breakpoints over `useDeviceDetect` for layout; UA detect OK for `#pc-wrap` / `#mobile-wrap` shell until PM-12 QA. |
| MOB-04 | **Touch UX:** Mobile phase adds `:active` / tap feedback; hover-only effects (marquee pause, chip scale) must have touch equivalents. Min tap target 44×44px. |
| MOB-05 | **Mockup authority:** Auth mobile = `auth-flow-wireframe.png`. Homepage + customer pages = desktop mockup + responsive adaptation (no separate mobile PNG yet). |
| MOB-06 | **Legacy cleanup:** Replace Nestar styles in `scss/mobile/main.scss` with Fixora dark/orange tokens in `PM-01` — do not extend legacy property/agent mobile SCSS. |

---

## Out of Scope (MVP)

- ON_SITE repair (UI badge only — BIZ-01)
- Phone / SMS / OTP login (`AuthProvider.PHONE` removed from schema)
- Apple OAuth UI (until configured — AUTH-02)
- SMS / KakaoTalk push notifications (future)
- Advanced AI diagnostics
- Live tracking
- Separate admin UI design (build incrementally)
