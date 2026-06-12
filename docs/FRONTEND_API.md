# Fixora — Frontend GraphQL Integration Contract

> **Status:** Frozen for FixoraF integration (synced from FixoraB 2026-06-09)  
> **Endpoint:** `POST {{NEXT_PUBLIC_GRAPHQL_URL}}` (default `http://localhost:2000/graphql`)  
> **Schema file:** [`docs/schema.gql`](schema.gql) — sync from FixoraB `apps/fixora-api/src/graphql/schema.gql`  
> **Authority:** [`DECISIONS.md`](DECISIONS.md), [`AUTH_API.md`](AUTH_API.md)

This document is the **single integration reference** for FixoraF. Do not contradict backend business rules here.

---

## Conventions

| Item | Rule |
|------|------|
| Auth header | `Authorization: Bearer <accessToken>` on guarded operations |
| Public queries | `WithoutGuard` — no token required (e.g. `getTechnicians`, `heroRepairSearch`) |
| Login field | **`userEmail`** + password — **not** phone (AUTH-07) |
| Phone | `userPhoneNumber` collected at signup — **contact only**; hidden in chat until booking ACCEPTED (BIZ-04) |
| i18n | Backend errors/messages are **English**; KO/EN UI strings are **frontend-only** (`next-i18next` in FixoraF) |
| Payment | **Mock gateway** (PAY-05) — portfolio/demo; UI may show KakaoPay branding |

---

## Auth (see AUTH_API.md for full contract)

| Operation | Auth | Notes |
|-----------|------|-------|
| `signup` | Public | `userEmail`, `userNickname`, `userPassword`, `userPhoneNumber`, `userType`, `termsAcceptedAt` |
| `login` | Public | `LoginInput.userEmail` + `userPassword` only |
| `loginWithOAuth` | Public | `KAKAO`, `GOOGLE`, `APPLE` (Apple may be blocked until configured) |
| `completeOAuthSignup` | Bearer | Mandatory phone for new OAuth users |
| `refreshToken` | Public | Rotation via `refreshTokenVersion` |
| `requestPasswordReset` / `resetPassword` | Public | Email only — no SMS |
| `logout` | Bearer | Revokes refresh sessions |

**Do not implement:** phone/SMS/OTP login (`AuthProvider.PHONE` deprecated).

---

## AI (Hero Search + booking classify)

| Operation | Auth | Purpose |
|-----------|------|---------|
| `classifyRepairIssue` | Public | Text → structured `IssueClassificationResult` |
| `recommendTechnicians` | Public | Top N technicians from `problemText` or explicit filters |
| `heroRepairSearch` | Public | Classify + recommend in one call (Homepage Hero) |

**Rules (BIZ-06, BIZ-07, AI-03):**

- Display AI results only — **never** auto-set `technicianId` on booking
- User always picks technician before `createBooking`
- `createBooking` may auto-fill `aiClassification` embed when `problemDescription` set (non-blocking)

**`IssueClassificationResult` fields:** `deviceType`, `issueCategory`, `repairComplexity`, `confidenceScore`, `keywords`, `provider` (`GEMINI` | `RULE_BASED`)

---

## Device

| Operation | Auth | Role |
|-----------|------|------|
| `createDevice` | Bearer | USER owner |
| `getMyDevices` | Bearer | USER |
| `getDevice` | Public | — |
| `updateDevice` | Bearer | Owner |
| `removeDevice` | Bearer | Owner soft-delete |

---

## Booking

| Operation | Auth | Role / notes |
|-----------|------|--------------|
| `createBooking` | Bearer | USER — requires `deviceId`, `technicianId`, `bookingType: SHOP_VISIT` |
| `getMyBookings` | Bearer | USER |
| `getTechnicianBookings` | Bearer | TECHNICIAN |
| `getIncomingRequests` | Bearer | TECHNICIAN — PENDING |
| `acceptBooking` / `rejectBooking` | Bearer | TECHNICIAN (APPROVED) |
| `updateBookingStatus` | Bearer | TECHNICIAN — e.g. IN_PROGRESS (deposit gate) |
| `addProgressUpdate` | Bearer | TECHNICIAN — IN_PROGRESS only |
| `completeBooking` | Bearer | TECHNICIAN |
| `cancelBooking` | Bearer | USER — cancellable statuses only |
| `updateBooking` | Bearer | USER — PENDING only |

**Statuses:** `PENDING`, `ACCEPTED`, `REJECTED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`  
**Type:** `SHOP_VISIT` only — `ON_SITE` = "Coming Soon" UI (BIZ-01)

**Embed:** `booking.aiClassification` — `deviceType`, `issueCategory`, `repairComplexity`, `confidenceScore`, `keywords`, `classifiedAt`

---

## Payment (mock — PAY-05)

| Step | Operation |
|------|-----------|
| 1 | `initiatePayment` — `DEPOSIT` or `FINAL` |
| 2 | `confirmPayment` — mock verify for KAKAOPAY/CARD |
| Cash final | `confirmCashPayment` — TECHNICIAN confirms |

Deposit **COMPLETED** gates `ACCEPTED → IN_PROGRESS`.

---

## Technician discovery

| Operation | Auth | Notes |
|-----------|------|-------|
| `getTechnicians` | Public | APPROVED + ACTIVE only; filters in `TechniciansInquiry` |
| `getUser` | Public | Public profile |

Prefer AI `recommendTechnicians` / `heroRepairSearch` for Hero-driven discovery.

### `getTechnicians` search filters (`TISearch`)

| Field | Type | Notes |
|-------|------|-------|
| `text` | String | Nickname, shop name, specialty, location text |
| `deviceCategory` | `DeviceCategory` | iPhone, MacBook, etc. |
| `isOnline` | Boolean | Omit = online-only; `null` = all |
| `minAverageRating` | Float | Minimum rating |
| `userLocation` | String | Regex on location label — used when **no** geo coords sent |
| `latitude` | Float | User/search center latitude (with `longitude` enables radius filter) |
| `longitude` | Float | User/search center longitude |
| `radiusKm` | Float | Radius in km; default **10** when geo active |

**Geo rule:** When `latitude` + `longitude` are provided, backend filters by Haversine distance and sorts nearest-first. `userLocation` string filter is skipped. Technicians without `shopLatitude` / `shopLongitude` are excluded from geo-filtered results (no map pin).

**User response fields for map pins:** `shopLatitude`, `shopLongitude` on each technician in `getTechnicians.list`.

---

## Article (community)

| Operation | Auth | Notes |
|-----------|------|-------|
| `getArticles` | Public | PUBLISHED feed |
| `getArticle` | Public | Single post + `authorData` |
| `getMyArticles` | Bearer | TECHNICIAN — drafts + published |
| `createArticle` / `updateArticle` / `deleteArticle` | Bearer | TECHNICIAN owner |
| `likeTargetArticle` | Bearer | Any auth user |

**Author field:** `authorData` (User) — **preferred**  
**Do not use:** `BoardArticle`, `getBoardArticles`, `memberId` on article (removed)

---

## Social — follow, comment, like

### Follow (preferred Fixora names)

| Preferred | Legacy (still works) |
|-----------|----------------------|
| `getUserFollowings` | `getMemberFollowings` |
| `getUserFollowers` | `getMemberFollowers` |

`subscribe` / `unsubscribe` — Bearer.

### Comment

| Operation | Auth |
|-----------|------|
| `getComments` | Public |
| `createComment` / `updateComment` | Bearer |

| Field | Use |
|-------|-----|
| `authorData` | **Preferred** — comment author (User) |
| `memberData` | Legacy alias — same data |
| `memberId` | Legacy — stores User `_id` |

### Like

`likeTargetUser`, `likeTargetArticle` — Bearer.

---

## Message + WebSocket

| Operation | Auth |
|-----------|------|
| `sendMessage` | Bearer |
| `getMessages` | Bearer |
| `getMyConversations` | Bearer |
| `markMessagesAsRead` | Bearer |

**WS:** `ws://host:port?token=<accessToken>` — events: `messageReceived`, `notificationReceived`

Pre-booking chat: `bookingId` nullable on messages.

---

## Review + Notification

| Operation | Auth |
|-----------|------|
| `createReview` | Bearer USER — COMPLETED booking, 1 per booking |
| `getTechnicianReviews` | Public |
| `getNotifications` | Bearer |
| `markNotificationRead` / `markAllNotificationsRead` | Bearer |

---

## Legacy Nestar naming (intentional)

| Layer | Legacy name | Meaning | Frontend action |
|-------|-------------|---------|-----------------|
| GraphQL follow | `getMemberFollowings` | User followings list | Use `getUserFollowings` instead |
| GraphQL comment | `memberId`, `memberData` | Comment author | Use `authorData`; keep `memberId` when writing mutations |
| MongoDB social | `memberId` on like/view/comment | User `_id` | Do not rename — no migration in MVP |
| Article | ~~`BoardArticle`~~ | Removed | Use `Article` type only |

---

## Frontend checklist (MVP screens)

| Screen | Key operations |
|--------|----------------|
| Login / Register | `login`, `signup`, `loginWithOAuth`, `completeOAuthSignup` |
| Homepage Hero | `heroRepairSearch` |
| Search | `getTechnicians` |
| Technician profile | `getUser` |
| Booking flow | `createDevice`, `createBooking`, `initiatePayment`, `confirmPayment` |
| My Page | `getMyDevices`, `getMyBookings`, `getUserFollowings` |
| Messages | `getMyConversations`, `getMessages`, `sendMessage` |
| Community | `getArticles`, `getArticle`, `getComments`, `createComment` |
| Technician dashboard | `getIncomingRequests`, `acceptBooking`, `getTechnicianBookings` |

---

## Related docs

- [`AGENTS.md`](../AGENTS.md) — agent instructions
- [`AUTH_API.md`](AUTH_API.md) — auth detail
- [`NEXT_SESSION.md`](NEXT_SESSION.md) — current active task prompt
- [`FIXORA-ANALIZ.md`](FIXORA-ANALIZ.md) — UI mockups §9
