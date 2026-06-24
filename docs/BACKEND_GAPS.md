# Fixora — Frontend → Backend Gaps Registry (FixoraB)

> **Maqsad:** FixoraF da dizayn/UI bor, FixoraB da logika/API yo‘q yoki qisman bo‘lgan joylarni yagona ro‘yxatda saqlash.  
> **Kim yangilaydi:** Backend agent gap hal qilganda `Status` → `DONE` + `FRONTEND_API.md` / `docs/schema.gql` sync.  
> **Last updated:** 2026-06-24 (GAP-113 technician self-profile workaround)

**Bog‘liq hujjatlar:**
- GraphQL: [`FRONTEND_API.md`](FRONTEND_API.md), [`docs/schema.gql`](schema.gql)
- Payout + reviews: [`PAYOUT_API.md`](PAYOUT_API.md)
- Admin contract: [`BACKEND_ADMIN.md`](BACKEND_ADMIN.md)
- Qarorlar: [`DECISIONS.md`](DECISIONS.md)

---

## Implementation phases (roadmap)

| Phase | Fokus | Gap IDs | FixoraB status |
|-------|--------|---------|----------------|
| **0** | Contract sync + admin API tayyor | 070–077 | ✅ FixoraB done — FixoraF ulanishi kutilmoqda |
| **1** | Payout + client reviews (P0) | 010–014, 031 | ✅ FixoraB done |
| **2** | Response time + schedule + search (P1) | 001, 020, 030, 040, 099 | ✅ FixoraB done |
| **3** | Analytics, discovery, article (P2) | 002–004, 021, 080–086, 097, 100, 003 | ✅ FixoraB done |
| **4** | Notif, messages, settings, social (P3) | 060–063, 087–089, 090–096, 098, 032 | ✅ FixoraB done |
| **5** | Post-MVP | 041, 051 | ⏸ DECISIONS kerak · GAP-050 ✅ |
| **Admin user mgmt** | `/_admin/users/[id]` | 078, 101–112 | ✅ FixoraF wired |

---

## Status belgilari

| Status | Ma'nosi |
|--------|---------|
| `MISSING` | Backendda model/query/mutation yo‘q |
| `PARTIAL` | Schema/maydon bor, to‘liq ishlamaydi |
| `WORKAROUND` | Frontend mock/localStorage/hack |
| `MOCK` | Ataylab mock (masalan PAY-05) |
| `DONE` | FixoraB tayyor (FixoraF ulanishi alohida) |

---

## Phase 0 — Sync checklist

### FixoraB (this repo) ✅

- [x] GAP-071…077 implemented (`AdminModule`)
- [x] [`BACKEND_ADMIN.md`](BACKEND_ADMIN.md) contract
- [x] [`FRONTEND_API.md`](FRONTEND_API.md) admin section
- [x] [`docs/schema.gql`](schema.gql) — `apps/fixora-api/src/graphql/schema.gql` nusxasi
- [x] Full gaps registry (this file)

### FixoraF (this repo) ✅ — 2026-06-23

- [x] `getAdminUserDetail` — `useAdminUserDetail` single query
- [x] Admin user actions — `adminResetPassword`, `setTechnicianBadgeLevel`, `revokeTechnicianVerification`, `warnUser`, `addVerificationAdminNote`
- [x] User detail sections — login history, moderation, comments, reports, verification timeline
- [x] Verification queue — PENDING approve/reject (GAP-110/111)
- [x] Device upload — `imageUploader` target `device` (GAP-112)
- [x] Customer settings — security, notifications, payment methods (GAP-090/092/093)
- [x] Customer settings — email/slug, app preferences, delete account (GAP-094/095/096)
- [x] Navbar notification dropdown — `deleteNotification`

**Skipped (by design):** GAP-041 ON_SITE, GAP-051 real KakaoPay, GAP-050 Apple OAuth UI stays Coming Soon

---

## Ro‘yxat

### Admin (P3-15)

| ID | UI | Backend | Status | FixoraB |
|----|-----|---------|--------|---------|
| GAP-070 | Verification queue | `getTechnicianVerificationQueue`, approve/reject | `DONE` | ✅ |
| GAP-071 | Dashboard analytics | `getAdminDashboardStats` | `DONE` | ✅ |
| GAP-072 | Activity feed | `getAdminRecentActivity` | `DONE` | ✅ |
| GAP-073 | Payment summary | `getAdminPaymentSummary` | `DONE` | ✅ |
| GAP-074 | Verification tabs | `TVISearch.verificationStatus` | `DONE` | ✅ |
| GAP-075 | Admin comments | `getAllCommentsByAdmin` | `DONE` | ✅ |
| GAP-076 | Platform settings | `getAdminPlatformSettings` / `updateAdminPlatformSettings` | `DONE` | ✅ |
| GAP-077 | Global search | `adminGlobalSearch` | `DONE` | ✅ |

---

### Analytics — `/technician/analytics` (Phase 2–3)

| ID | UI | Backend kerak | Status | Phase |
|----|-----|---------------|--------|-------|
| GAP-001 | Avg Response KPI | `avgResponseMinutes` / `getTechnicianAnalytics` | `DONE` | ✅ |
| GAP-002 | Top Performer KPI | `getTechnicianRank` | `DONE` | ✅ |
| GAP-003 | KPI trend badges | Period-over-period analytics | `DONE` | ✅ |
| GAP-004 | Revenue → Camera | `IssueCategory.CAMERA` | `DONE` | ✅ |

**Ishlaydi:** Total Jobs, Completion Rate, Repeat Clients, Avg Rating, charts — `getTechnicianBookings`, `getUser`, `getTechnicianReviews`.

---

### Earnings & Payouts — `/technician/earnings` (Phase 1) ✅

| ID | UI | Backend | Status | FixoraB |
|----|-----|---------|--------|---------|
| GAP-010 | Request Payout | `requestPayout` | `DONE` | ✅ |
| GAP-011 | Withdraw / Available Balance | `getWalletBalance` | `DONE` | ✅ |
| GAP-012 | Next Payout | `nextPayoutAt`, `estimatedAmount` | `DONE` | ✅ |
| GAP-013 | Payout History | `getMyPayouts` | `DONE` | ✅ |
| GAP-014 | Monthly Payouts chart | `Payout` + `getMyPayouts` | `DONE` | ✅ |

Contract: [`PAYOUT_API.md`](PAYOUT_API.md)

---

### Technician Dashboard (Phase 2)

| ID | UI | Backend kerak | Status | Phase |
|----|-----|---------------|--------|-------|
| GAP-020 | Schedule Add (custom) | `TechnicianSchedule` CRUD | `DONE` | ✅ |
| GAP-021 | Export Report | `exportEarningsReport` | `DONE` | ✅ |

**Ishlaydi:** Weekly earnings, booking schedule, `updateUser.isOnline`, requests, active jobs.

| ID | UI | Backend kerak | Status | Notes |
|----|-----|---------------|--------|-------|
| GAP-113 | Technician portal self-profile (PENDING signup) | `getUser` is public + APPROVED-only | `WORKAROUND` | FixoraF: settings always queries `GET_TECHNICIAN_SETTINGS`; server-synced `technicianSettingsCache` (localStorage) after query/mutation; JWT fallback for sparse fields until `getMyProfile` bearer query |

---

### Public profiles

| ID | UI | Backend | Status | Phase |
|----|-----|---------|--------|-------|
| GAP-030 | Response time display | `avgResponseMinutes` | `DONE` | ✅ |
| GAP-031 | Client reviews on `/member` | `getUserReviews` | `DONE` | ✅ |
| GAP-032 | Followers/Reviews count | Count sync | `DONE` | ✅ |

---

### Search & discovery (Phase 2–3)

| ID | UI | Backend kerak | Status | Phase |
|----|-----|---------------|--------|-------|
| GAP-040 | Search filters | `getTechnicians` audit | `DONE` | ✅ |
| GAP-041 | ON_SITE booking | `BookingType.ON_SITE` flow | `MISSING` | 5 |
| GAP-097 | Platform stats | `getTechnicianPlatformStats` | `DONE` | ✅ |
| GAP-099 | Fast responders | `avgResponseMinutes` | `DONE` | ✅ |
| GAP-100 | Trending row | `getTechnicianTrending` | `DONE` | ✅ |

---

### Auth & payments (Phase 5)

| ID | UI | Backend kerak | Status | Phase |
|----|-----|---------------|--------|-------|
| GAP-050 | Apple OAuth | Apple credentials + `loginWithOAuth(APPLE)` | `DONE` | ✅ |
| GAP-051 | Real payment gateway | KakaoPay production | `MOCK` | 5 |
| GAP-114 | Signup uniqueness (email, phone, nickname, name, OAuth provider) | `checkSignupAvailability` public query + Mongo unique indexes | `DONE` | FixoraF wired: `CHECK_SIGNUP_AVAILABILITY` + `assertSignupFieldsAvailable` |

---

### Notifications & social (Phase 4)

| ID | UI | Backend kerak | Status | Phase |
|----|-----|---------------|--------|-------|
| GAP-060 | Follow notifications (eski) | Backfill / feed | `DONE` | ✅ |
| GAP-061 | Payment notif + delete | `PAYMENT` type, `deleteNotification` | `DONE` | ✅ |
| GAP-062 | Complete/payment WS | Payment notification hook | `DONE` | ✅ |
| GAP-063 | Public client profile | `getPublicClientProfile` | `DONE` | ✅ |
| GAP-098 | Saved technicians | `getUserLikedTechnicians` | `DONE` | ✅ |

---

### Write Article / Community (Phase 3)

| ID | UI | Backend kerak | Status | Phase |
|----|-----|---------------|--------|-------|
| GAP-080 | Repair category pills | `ArticleCategory` + `repairDeviceCategory` | `DONE` | ✅ |
| GAP-081 | SEO fields | Article SEO input | `DONE` | ✅ |
| GAP-082 | Visibility toggle | `articleVisibility` | `DONE` | ✅ |
| GAP-083 | Featured article | `isFeatured` | `DONE` | ✅ |
| GAP-084 | Comments / schedule publish | `allowComments`, `scheduledPublishAt` | `DONE` | ✅ |
| GAP-085 | Save/bookmark article | `saveArticle` / `unsaveArticle` | `DONE` | ✅ |
| GAP-086 | Increment article view | `incrementArticleView` | `DONE` | ✅ |

---

### Messages (Phase 4)

| ID | UI | Backend kerak | Status | Phase |
|----|-----|---------------|--------|-------|
| GAP-087 | Image upload | `uploadMessageImage` / `attachmentUrl` | `DONE` | ✅ |
| GAP-088 | Conversation device label | `getMyConversations.deviceLabel` | `DONE` | ✅ |
| GAP-089 | Peer thread merge | `getMessages` by `peerId` | `DONE` | ✅ |

---

### Technician Settings (Phase 4)

| ID | UI | Backend kerak | Status | Phase |
|----|-----|---------------|--------|-------|
| GAP-090 | Change password (verify old) | `changePassword` | `DONE` | ✅ |
| GAP-091 | 2FA | `enable2FA` / `disable2FA` | `DONE` | ✅ |
| GAP-092 | Notification prefs | preferences API | `DONE` | ✅ |
| GAP-093 | Saved payment methods | payment methods CRUD | `DONE` | ✅ |
| GAP-094 | User preferences | preferences API | `DONE` | ✅ |
| GAP-095 | Delete account | `deleteAccount` | `DONE` | ✅ |
| GAP-096 | Profile slug / email | `userSlug`, `updateEmail` | `DONE` | ✅ |

---

### Admin user detail (GAP-078, 101–112)

| ID | UI | Backend | Status | FixoraB |
|----|-----|---------|--------|---------|
| GAP-078 | Admin notification bell | Shared `getNotifications` | `DONE` | ✅ |
| GAP-101 | Aggregated user detail | `getAdminUserDetail` | `DONE` | ✅ |
| GAP-102 | Grant/remove Premium | `setTechnicianBadgeLevel` | `DONE` | ✅ |
| GAP-103 | Revoke verification | `revokeTechnicianVerification` | `DONE` | ✅ |
| GAP-104 | Send warning | `warnUser`, `getUserModerationHistory` | `DONE` | ✅ |
| GAP-105 | Login audit | `getUserLoginHistory` | `DONE` | ✅ |
| GAP-106 | Verification timeline | `verificationTimeline`, `addVerificationAdminNote` | `DONE` | ✅ |
| GAP-107 | Comments by user | `getAllCommentsByAdmin` + `authorId` | `DONE` | ✅ |
| GAP-108 | Reports received | `getStoryReports` + `userId` (story owner) | `DONE` | ✅ |
| GAP-109 | Admin reset password | `adminResetPassword`; block `userPassword` on admin update | `DONE` | ✅ |
| GAP-110 | Approve from PENDING | `approveTechnician` extended | `DONE` | ✅ |
| GAP-111 | Reject from PENDING | `rejectTechnician` extended | `DONE` | ✅ |
| GAP-112 | Device image upload | `allowedUploadTargets` + `device` | `DONE` | ✅ |

---

## O‘zgarishlar tarixi

| Sana | O‘zgarish |
|------|-----------|
| 2026-06-18 | FixoraF dastlabki registry (Analytics, Earnings, …) |
| 2026-06-22 | Phase 1 — GAP-010…014, GAP-031 | `PayoutModule`, `getUserReviews` | FixoraB |
| 2026-06-22 | Phase 2 — GAP-001, 020, 030, 040, 099 | `AnalyticsModule`, `ScheduleModule`, `avgResponseMinutes` | FixoraB |
| 2026-06-22 | Phase 4 — GAP-060…063, 087…089, 090…096, 098, 032 | SettingsModule, messages, notifications, social | FixoraB |
| 2026-06-23 | GAP-078, 101–112 | FixoraF wired — admin user detail, settings, device upload |
