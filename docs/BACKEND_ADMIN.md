# Fixora — Admin Panel GraphQL Contract

> **Status:** Implemented (GAP-071…077) — 2026-06-22  
> **Auth:** Bearer + `UserType.ADMIN` on all operations below  
> **Schema:** [`apps/fixora-api/src/graphql/schema.gql`](../apps/fixora-api/src/graphql/schema.gql)

---

## Routes (FixoraF)

| Route | Backend operations |
|-------|-------------------|
| `/_admin` | `getAdminDashboardStats`, `getAdminRecentActivity`, `getAdminPaymentSummary` |
| `/_admin/verification` | `getTechnicianVerificationQueue` (GAP-074 filter) |
| `/_admin/users` | `getAllUsersByAdmin`, `updateUserByAdmin` |
| `/_admin/bookings` | `getAllBookingsByAdmin` |
| `/_admin/payments` | `getAllPaymentsByAdmin`, `getAdminPaymentSummary`, `refundPayment` |
| `/_admin/devices` | `getAllDevicesByAdmin` |
| `/_admin/moderation` | `getAllArticlesByAdmin`, `getAllCommentsByAdmin`, `getStoryReports`, … |
| `/_admin/settings` | `getAdminPlatformSettings`, `updateAdminPlatformSettings` |
| Global search | `adminGlobalSearch` |

---

## GAP-071 — `getAdminDashboardStats`

```graphql
query GetAdminDashboardStats($period: AdminDashboardPeriod!) {
  getAdminDashboardStats(period: $period) {
    period
    totalUsers { value trendPercent }
    totalTechnicians { value trendPercent verifiedCount }
    pendingVerifications { value trendPercent }
    totalBookings { value trendPercent activeCount }
    platformRevenue { value trendPercent }
    openReports { value trendPercent criticalCount }
    monthlySeries { month revenue bookings }
  }
}
```

| Input | Values |
|-------|--------|
| `period` | `MONTH`, `QUARTER`, `YEAR` |

**Semantics:**

- KPI `value` = current snapshot (users, technicians, bookings, pending verifications, open reports) or current-period revenue for `platformRevenue`
- `trendPercent` = growth in current period vs previous period (calendar month/quarter/year)
- `monthlySeries` = last 12 months (`YYYY-MM`, revenue from COMPLETED payments, bookings count)
- `verifiedCount` = APPROVED technicians; `activeCount` = IN_PROGRESS bookings; `criticalCount` = PENDING reports with `OFFENSIVE_CONTENT` or `COPYRIGHT_VIOLATION`

---

## GAP-073 — `getAdminPaymentSummary`

```graphql
query GetAdminPaymentSummary {
  getAdminPaymentSummary {
    totalRevenue
    pendingAmount pendingCount
    refundedAmount refundedCount
    failedAmount failedCount
    currency
  }
}
```

`currency` is always `"KRW"` for MVP.

---

## GAP-072 — `getAdminRecentActivity`

```graphql
query GetAdminRecentActivity($limit: Int) {
  getAdminRecentActivity(limit: $limit) {
    eventType
    message
    createdAt
    severity
    actorName
    entityId
  }
}
```

| `eventType` | Source |
|-------------|--------|
| `USER_SIGNUP` | users |
| `BOOKING_CREATED` | bookings |
| `PAYMENT_RECEIVED` | payments (COMPLETED) |
| `STORY_REPORTED` | story_reports (PENDING) |
| `TECHNICIAN_APPROVED` | users (APPROVED, `updatedAt`) |
| `BOOKING_COMPLETED` | bookings (COMPLETED) |

| `severity` | Rule |
|------------|------|
| `INFO` | Default |
| `WARNING` | Story reported (non-critical reason) |
| `CRITICAL` | Story reported with critical reason |

---

## GAP-074 — Verification filter

`getTechnicianVerificationQueue` input extended:

```graphql
input TVISearch {
  text: String
  verificationStatus: VerificationStatus
}
```

| Tab | `search.verificationStatus` |
|-----|----------------------------|
| Pending review | `UNDER_REVIEW` |
| Approved | `APPROVED` |
| Rejected | `REJECTED` |
| All | omit field |

When omitted, returns technicians with `PENDING`, `UNDER_REVIEW`, `APPROVED`, or `REJECTED` (not `NONE`).

---

## GAP-075 — `getAllCommentsByAdmin`

```graphql
query GetAllCommentsByAdmin($input: AllCommentsInquiry!) {
  getAllCommentsByAdmin(input: $input) {
    list {
      _id
      commentContent
      commentStatus
      commentRefId
      createdAt
      authorData { _id userNickname userImage }
      articleTitle
    }
    metaCounter { total }
  }
}
```

Filters: `search.commentStatus`, `search.text` (content regex).

---

## GAP-076 — Platform settings

```graphql
query GetAdminPlatformSettings {
  getAdminPlatformSettings {
    defaultLocale
    defaultCurrency
    defaultTimezone
    moderationSlaHours
  }
}

mutation UpdateAdminPlatformSettings($input: UpdateAdminPlatformSettingsInput!) {
  updateAdminPlatformSettings(input: $input) {
    defaultLocale
    defaultCurrency
    defaultTimezone
    moderationSlaHours
  }
}
```

Defaults: `ko`, `KRW`, `Asia/Seoul`, `24`. Stored in `platform_config` singleton (`_id: "default"`).

---

## GAP-077 — `adminGlobalSearch`

```graphql
query AdminGlobalSearch($query: String!, $limit: Int) {
  adminGlobalSearch(query: $query, limit: $limit) {
    users { _id label subtitle route }
    bookings { _id label subtitle route }
    payments { _id label subtitle route }
  }
}
```

| Entity | Search fields | `route` |
|--------|---------------|---------|
| users | nickname, email, phone | `/_admin/users` |
| bookings | problemTitle, `_id` | `/_admin/bookings` |
| payments | transactionId, bookingId | `/_admin/payments` |

---

## GAP-078 — Admin notifications

`AdminNotificationBell` uses shared **`getNotifications`** (Bearer ADMIN). No dedicated admin query required — mark **DONE** with shared feed.

---

## Admin user detail — `/_admin/users/[id]` (GAP-101…112)

### GAP-101 — `getAdminUserDetail`

```graphql
query GetAdminUserDetail($userId: String!) {
  getAdminUserDetail(userId: $userId) {
    user { _id userType userEmail userNickname verificationStatus badgeLevel verificationTimeline { action note createdAt } }
    bookingStats { total completed active totalSpent }
    recentBookings { _id problemTitle bookingStatus }
    recentPayments { _id paymentAmount paymentStatus }
    articles { _id articleTitle articleStatus }
    stories { _id caption }
    technicianReviews { _id }
    userReviews { _id }
    clientProfile { totalBookings totalSpent }
    analytics { totalJobs completionRate }
    moderationHistory { action reason createdAt }
    loginHistory { success authProvider createdAt }
    commentsByUser { _id commentContent }
    reportsReceived { _id reason status }
  }
}
```

### GAP-109 — `adminResetPassword`

```graphql
mutation AdminResetPassword($input: AdminResetPasswordInput!) {
  adminResetPassword(input: $input)
}
```

- **Only** admin password change path. `updateUserByAdmin` **rejects** `userPassword` → use this mutation.
- Bumps `refreshTokenVersion`; writes moderation log `PASSWORD_RESET`.

### GAP-102 / GAP-103 — Badge + revoke

```graphql
mutation SetTechnicianBadgeLevel($userId: String!, $badgeLevel: BadgeLevel!) {
  setTechnicianBadgeLevel(userId: $userId, badgeLevel: $badgeLevel) { _id badgeLevel isVerified }
}

mutation RevokeTechnicianVerification($userId: String!, $reason: String) {
  revokeTechnicianVerification(userId: $userId, reason: $reason) { _id verificationStatus }
}
```

### GAP-104 / GAP-105 / GAP-106 — Moderation + audit

```graphql
mutation WarnUser($input: WarnUserInput!) { warnUser(input: $input) { _id action reason } }
query GetUserModerationHistory($userId: String!, $input: UserModerationHistoryInquiry!) { ... }
query GetUserLoginHistory($userId: String!, $input: LoginHistoryInquiry!) { ... }
mutation AddVerificationAdminNote($userId: String!, $note: String!) { addVerificationAdminNote(userId: $userId, note: $note) { verificationAdminNotes } }
```

User embed: `verificationAdminNotes`, `verificationTimeline[]`.

### GAP-107 — Comments by author

`getAllCommentsByAdmin` → `search.authorId` maps to MongoDB `memberId`.

### GAP-108 — Story reports by story owner

`getStoryReports` → `input.userId` filters reports where **story owner** matches (via `$lookup` on `stories`).

### GAP-112 — Device image upload

`imageUploader` / `imagesUploader` target **`device`** whitelisted → `uploads/device/`.

---

## Pre-existing admin operations (unchanged)

`getAllUsersByAdmin`, `getAllBookingsByAdmin`, `getAllDevicesByAdmin`, `getAllPaymentsByAdmin`, `getAllArticlesByAdmin`, `getTechnicianVerificationQueue`, `approveTechnician`, `rejectTechnician`, `getStoryReports`, `getStory`, `removeStory`, `reviewStoryReport`, `warnTechnicianForStory`, `updateUserByAdmin`, `updateArticleByAdmin`, `removeArticleByAdmin`, `removeCommentByAdmin`, `refundPayment`

---

## Related

- [`BACKEND_GAPS.md`](BACKEND_GAPS.md) — gap tracker
- [`FRONTEND_API.md`](FRONTEND_API.md) — full frontend contract
- [`AUTH_API.md`](AUTH_API.md) — verification flow §9.4
