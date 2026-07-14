# Fixora — Frontend GraphQL Integration Contract

> **Status:** Frozen for FixoraF / `fixora-web` integration (2026-06-09)  
> **Endpoint:** `POST {{NEXT_PUBLIC_GRAPHQL_URL}}` (default `http://localhost:2000/graphql`)  
> **Schema file:** [`apps/fixora-api/src/graphql/schema.gql`](../apps/fixora-api/src/graphql/schema.gql) — auto-regenerated on API start  
> **FixoraF sync copy:** [`docs/schema.gql`](schema.gql) — update when schema changes  
> **Gaps & phases:** [`BACKEND_GAPS.md`](BACKEND_GAPS.md)
> **Authority:** [`DECISIONS.md`](DECISIONS.md), [`AUTH_API.md`](AUTH_API.md), [`PAYMENT_API.md`](PAYMENT_API.md)

This document is the **single integration reference** for the separate frontend repo (`FixoraF`). Do not contradict backend business rules here.

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
| `checkSignupAvailability` | Public | Pre-signup uniqueness check — `userEmail`, `userNickname`, `userPhoneNumber`, `userFullName`, optional `excludeUserId` |
| `login` | Public | `LoginInput.userEmail` + `userPassword` only |
| `loginWithOAuth` | Public | `KAKAO`, `GOOGLE`, `APPLE` — requires provider env (`APPLE_CLIENT_ID`, etc.) |
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

See [`PAYMENT_API.md`](PAYMENT_API.md). Summary:

| Step | Operation |
|------|-----------|
| 1 | `initiatePayment` — `DEPOSIT` or `FINAL` |
| 2 | `confirmPayment` — mock verify for KAKAOPAY/CARD |
| Cash final | `confirmCashPayment` — TECHNICIAN confirms |

Deposit **COMPLETED** gates `ACCEPTED → IN_PROGRESS`.

---

## Payout (technician earnings — Phase 1)

> Full contract: [`PAYOUT_API.md`](PAYOUT_API.md)  
> **Auth:** Bearer + `UserType.TECHNICIAN`

| Operation | Type | Purpose |
|-----------|------|---------|
| `getWalletBalance` | Query | Available/pending/total + `nextPayoutAt` |
| `getMyPayouts(input)` | Query | Payout history (monthly chart source) |
| `requestPayout(input)` | Mutation | Withdraw available balance (MVP mock → instant `COMPLETED`) |

---

## Reviews

| Operation | Auth | Notes |
|-----------|------|-------|
| `createReview` | Bearer USER | COMPLETED booking, 1 per booking |
| `getTechnicianReviews` | Public | By `technicianId` + distribution |
| `getUserReviews` | Public | **GAP-031** — reviews written by client `userId` |
| `getMyReviews` | Bearer | Auth user's reviews |
| `getBookingReview` | Bearer | Participant only |

---

## Technician discovery

| Operation | Auth | Notes |
|-----------|------|-------|
| `getTechnicians` | Public | APPROVED + ACTIVE + not blocked; filters in `TechniciansInquiry` |
| `getUser` | Public | Public profile; TECHNICIAN must be APPROVED |

Prefer AI `recommendTechnicians` / `heroRepairSearch` for Hero-driven discovery.

### `getTechnicians` — `TechniciansInquiry`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `page` | `Int!` | Yes | Min 1 |
| `limit` | `Int!` | Yes | Min 1 |
| `sort` | `String` | No | Default `userRank` |
| `direction` | `Direction` | No | Default `DESC` |
| `search` | `TISearch!` | Yes | Object required; inner fields optional |

**Sort keys:** `createdAt`, `updatedAt`, `userLikes`, `userViews`, `userRank`, `averageRating`, `completedJobsCount`

### `TISearch` filters

| Field | Type | Notes |
|-------|------|-------|
| `text` | `String` | Regex on `userNickname`, `shopName`, `specialty`, `userLocation` (escaped) |
| `deviceCategory` | `DeviceCategory` | `IPHONE`, `MACBOOK`, `IPAD`, `APPLE_WATCH` — matches `specialty` / `services.title` |
| `issueCategory` | `IssueCategory` | Hero → search deep-link; same regex heuristic as AI matching |
| `userLocation` | `String` | Regex on `userLocation` (not `location`) |
| `minAverageRating` | `Float` | 1–5; `averageRating >= value` (not `rating`) |
| `isOnline` | `Boolean` | **Omit** → online only; **`null`** → all; `true` / `false` → explicit |

**Empty results:** HTTP 200 with `{ list: [], metaCounter: [{ total: 0 }] }` — not an error.

**Suggested card fields:** `_id`, `userNickname`, `shopName`, `specialty`, `averageRating`, `reviewCount`, `completedJobsCount`, `isOnline`, `userProfileImage`, `userLocation`, `badgeLevel`, `userRank`

### Example

```graphql
query GetTechnicians($input: TechniciansInquiry!) {
  getTechnicians(input: $input) {
    list {
      _id
      userNickname
      shopName
      specialty
      averageRating
      reviewCount
      isOnline
      userProfileImage
      userLocation
    }
    metaCounter { total }
  }
}
```

```json
{
  "input": {
    "page": 1,
    "limit": 12,
    "sort": "averageRating",
    "direction": "DESC",
    "search": {
      "text": "강남",
      "deviceCategory": "IPHONE",
      "userLocation": "서울",
      "minAverageRating": 4,
      "isOnline": null
    }
  }
}
```

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

## Analytics & schedule (Phase 2 — GAP-001, 020, 030, 040, 099)

| Operation | Auth | Purpose |
|-----------|------|---------|
| `getTechnicianAnalytics(technicianId)` | Public | KPI bundle: `avgResponseMinutes`, trends, `topPerformerPercentile` |
| `getTechnicianRank(technicianId)` | Public | `percentile`, `badgeLabel` (e.g. `Top 3%`) |
| `getMySchedule(input)` | TECHNICIAN | Custom schedule items |
| `createScheduleItem(input)` | TECHNICIAN | Block time outside bookings |
| `deleteScheduleItem(scheduleItemId)` | TECHNICIAN | Remove schedule item |

**`User.avgResponseMinutes`** — denormalized on technician profile; recomputed when technician sends a message (customer msg → first reply delta).

**Fast responders (GAP-099):** `getTechnicians` → `search.maxAvgResponseMinutes` + `sort: avgResponseMinutes`.

---

## Discovery (Phase 3 — GAP-097, 100)

| Operation | Auth | Purpose |
|-----------|------|---------|
| `getTechnicianPlatformStats` | Public | `totalTechnicians`, `joinedThisMonth`, `growthPercent` |
| `getTechnicianTrending(limit)` | Public | Momentum-ranked technicians (30-day bookings + reviews) |

---

## Earnings export (Phase 3 — GAP-021)

| Operation | Auth | Purpose |
|-----------|------|---------|
| `exportEarningsReport(input)` | TECHNICIAN | CSV as `contentBase64`; `period`: `LAST_30_DAYS`, `LAST_90_DAYS`, `THIS_MONTH`, `ALL_TIME` |

See also [`PAYOUT_API.md`](PAYOUT_API.md).

---

## Article community (Phase 3 — GAP-080…086)

**New Article fields:** `repairDeviceCategory`, `articleVisibility` (`PUBLIC` | `TECHNICIANS_ONLY`), `isFeatured`, `allowComments`, `scheduledPublishAt`, `seoTitle`, `seoDescription`, `seoKeywords`.

**Extended `ArticleCategory`:** `REPAIR_GUIDE`, `QUICK_TIP`, `CASE_STUDY`, `TECHNIQUE` (+ legacy `FREE`, `RECOMMEND`, `NEWS`, `HUMOR`).

| Operation | Auth | Purpose |
|-----------|------|---------|
| `saveArticle(articleId)` | Bearer | Bookmark article (`article_bookmarks` collection) |
| `unsaveArticle(articleId)` | Bearer | Remove bookmark |
| `incrementArticleView(articleId)` | Public | View count bump (deduped per user via `views` when logged in) |

**`IssueCategory.CAMERA`** added for analytics revenue-by-repair-type chart (GAP-004).

---

## Admin panel (GAP-071…077)

> Full contract: [`BACKEND_ADMIN.md`](BACKEND_ADMIN.md)  
> **Auth:** Bearer + `UserType.ADMIN` on all operations below.

| Operation | Type | Purpose |
|-----------|------|---------|
| `getAdminDashboardStats(period)` | Query | KPI + trend % + 12-month chart |
| `getAdminPaymentSummary` | Query | Revenue/pending/refunded/failed totals |
| `getAdminRecentActivity(limit)` | Query | Platform activity feed |
| `getAllCommentsByAdmin(input)` | Query | Paginated comments + `authorData`, `articleTitle` |
| `getAdminPlatformSettings` | Query | Locale/currency/timezone/SLA |
| `updateAdminPlatformSettings(input)` | Mutation | Update platform config |
| `adminGlobalSearch(query, limit)` | Query | Users, bookings, payments hits |

**Verification tabs (GAP-074):** `getTechnicianVerificationQueue` → `search.verificationStatus` optional. Pending review tab → `UNDER_REVIEW`; All tab → omit filter.

**Pre-existing admin:** `getAllUsersByAdmin`, `getAllBookingsByAdmin`, `getAllDevicesByAdmin`, `getAllPaymentsByAdmin`, `getAllArticlesByAdmin`, `approveTechnician`, `rejectTechnician`, `getStoryReports`, `refundPayment`, etc.

---

## Admin user detail (GAP-078, 101–112)

> Full contract: [`BACKEND_ADMIN.md`](BACKEND_ADMIN.md) § Admin user detail

| Operation | Type | Purpose |
|-----------|------|---------|
| `getAdminUserDetail(userId)` | Query | Aggregated `/_admin/users/[id]` payload |
| `adminResetPassword(input)` | Mutation | Secure admin password reset (GAP-109) |
| `setTechnicianBadgeLevel(userId, badgeLevel)` | Mutation | Premium badge control (GAP-102) |
| `revokeTechnicianVerification(userId, reason)` | Mutation | Revoke verification (GAP-103) |
| `warnUser(input)` | Mutation | Account warning + moderation log (GAP-104) |
| `getUserModerationHistory(userId, input)` | Query | Moderation history |
| `getUserLoginHistory(userId, input)` | Query | Login audit trail (GAP-105) |
| `addVerificationAdminNote(userId, note)` | Mutation | Verification note + timeline (GAP-106) |

**Filters:** `getAllCommentsByAdmin` → `search.authorId` (GAP-107). `getStoryReports` → `userId` = story owner (GAP-108).

**Upload:** `imageUploader` target `device` (GAP-112).

**Password rule:** `updateUserByAdmin` rejects `userPassword` — use `adminResetPassword` or user `changePassword`.

**Notifications (GAP-078):** Admin bell uses shared `getNotifications`.

**Verification (GAP-110/111):** `approveTechnician` / `rejectTechnician` allow `PENDING` and `UNDER_REVIEW`.

---

## Message + WebSocket

| Operation | Auth | Notes |
|-----------|------|-------|
| `sendMessage` | Bearer | TEXT / IMAGE (`uploads/message/...`) |
| `uploadMessageImage` | Bearer | Returns CDN path for `sendMessage` IMAGE type |
| `getMessages` | Bearer | Omit `bookingId` → all peer messages merged (GAP-089) |
| `getMyConversations` | Bearer | Includes `deviceLabel`, `deviceModel` when booking linked |
| `markMessagesAsRead` | Bearer | Omit `bookingId` → mark all peer threads |

**WS:** `ws://host:port?token=<accessToken>` — events: `messageReceived`, `notificationReceived`

Pre-booking chat: `bookingId` nullable on messages.

---

## Notifications (Phase 4)

| Operation | Auth | Notes |
|-----------|------|-------|
| `getNotifications` | Bearer | Filter `notificationType: PAYMENT` |
| `deleteNotification(notificationId)` | Bearer | Persistent delete (GAP-061) |
| `markNotificationRead` / `markAllNotificationsRead` | Bearer | — |

**Triggers:** follow → `FOLLOW`; payment complete → `PAYMENT` + WS; booking/message/review unchanged.

---

## Settings (Phase 4 — GAP-090…096)

| Operation | Auth |
|-----------|------|
| `changePassword(input)` | Bearer — verifies `currentPassword` |
| `updateEmail(input)` | Bearer |
| `updateUserSlug(input)` | Bearer |
| `deleteAccount(input)` | Bearer — confirmation `"DELETE"` |
| `getNotificationPreferences` / `updateNotificationPreferences` | Bearer |
| `getUserPreferences` / `updateUserPreferences` | Bearer |
| `enable2FA` / `verify2FASetup` / `disable2FA` / `getTwoFactorStatus` | Bearer |
| `getPaymentMethods` / `createPaymentMethod` / `updatePaymentMethod` / `deletePaymentMethod` | Bearer |

Collection: `user_payment_methods` (operational, not ER entity).

### Notification preferences (Phase 2 — NOTIF)

`getNotificationPreferences` returns:

| Field | Writable | Notes |
|-------|----------|-------|
| `bookingUpdates`, `messages`, `payments`, `reviews`, `marketing`, `followAlerts`, `emailDigest` | ✅ | Event category toggles |
| `notificationLanguage` | ✅ | `ko` \| `en` (default `ko`) |
| `emailEnabled` | ✅ | Requires `connectedEmail` |
| `telegramEnabled` | ✅ | Requires `telegramStatus: LINKED` |
| `smsEnabled`, `pushEnabled` | ✅ | Phase 7 stubs — delivery logs only until provider wired |
| `inAppEnabled` | ❌ | Always `true` |
| `connectedEmail` | ❌ | From `user.userEmail` |
| `emailSource` | ❌ | `EMAIL` \| `GOOGLE` \| `KAKAO` \| `APPLE` |
| `telegramStatus` | ❌ | `NOT_CONNECTED` \| `PENDING` \| `LINKED` \| `UNLINKED` |
| `telegramUsername` | ❌ | From `telegramLink` |

Signup / OAuth complete optional input:

```graphql
notificationSetup: {
  emailEnabled: Boolean
  telegramEnabled: Boolean   # stored intent only until bot link
  telegramUsername: String     # sets PENDING link
  notificationLanguage: String # ko | en
}
```

Errors: `NOTIFICATION_EMAIL_UNAVAILABLE`, `NOTIFICATION_TELEGRAM_NOT_LINKED`, `NOTIFICATION_INVALID_LANGUAGE`

### Multi-channel API (Phases 3–4 — NOTIF)

| Operation | Auth | Notes |
|-----------|------|-------|
| `requestTelegramLink` | Bearer | Returns `{ linkUrl, expiresAt }` — open in Telegram |
| `disconnectTelegram` | Bearer | Clears link + disables `telegramEnabled` |
| `sendPlatformAnnouncement(input)` | ADMIN | `{ titleKo, titleEn, bodyKo, bodyEn, actionUrl? }` |
| `registerPushToken(input)` | Bearer | `{ pushToken, platform: IOS }` — enables `pushEnabled` |
| `sendSupportNotification(input)` | ADMIN | Support reply to user |
| `sendCriticalSystemAlert(input)` | ADMIN | Broadcast or single-user critical alert |

Webhook (server): `POST /webhooks/telegram` — Telegram bot `/start <token>` linking

Email/Telegram delivery is automatic when preferences allow; in-app always created first.

---

## Social & profiles (Phase 4)

| Operation | Auth | Notes |
|-----------|------|-------|
| `getUserLikedTechnicians(input)` | Bearer | Saved technicians via `likeTargetUser` |
| `getPublicClientProfile(clientId)` | TECHNICIAN / ADMIN | Bookings, spend, reviews, saved count |

**Count fields:** `followersCount`, `reviewCount` on `User` — updated on follow/review (GAP-032).

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
| Admin dashboard | `getAdminDashboardStats`, `getAdminRecentActivity`, `getAdminPaymentSummary` |
| Admin search | `adminGlobalSearch` |
| Admin verification | `getTechnicianVerificationQueue` with `verificationStatus` filter |
| Admin moderation | `getAllCommentsByAdmin`, `getStoryReports`, `getAllArticlesByAdmin` |
| Admin settings | `getAdminPlatformSettings`, `updateAdminPlatformSettings` |

---

## Related docs

- [`FRONTEND_AGENTS.md`](FRONTEND_AGENTS.md) — copy to FixoraF `AGENTS.md`
- [`AUTH_API.md`](AUTH_API.md) — auth detail
- [`PAYMENT_API.md`](PAYMENT_API.md) — payment detail
- [`BACKEND_ADMIN.md`](BACKEND_ADMIN.md) — admin panel GraphQL contract
- [`BACKEND_GAPS.md`](BACKEND_GAPS.md) — gap tracker (GAP-071…077)
- [`FIXORA-ANALIZ.md`](FIXORA-ANALIZ.md) — UI mockups §9
