# FixoraB — Remaining Gaps Completion Prompt (copy-paste for backend agent)

> **Source:** FixoraF `docs/BACKEND_GAPS.md` audit (2026-06-23)  
> **Goal:** Close **all** open backend gaps so FixoraF admin user management and related flows work without placeholders, workarounds, or corrupt mutations.  
> **Repos:** Implement in **FixoraB** (`FIXORAB` / `fixora-api`). Sync contract back to FixoraF `docs/FRONTEND_API.md`, `docs/schema.gql`, `docs/BACKEND_GAPS.md`, `docs/BACKEND_ADMIN.md`, `docs/AUTH_API.md` when done.

---

## Agent prompt (start here)

You are working on **FixoraB** (NestJS + GraphQL). FixoraF frontend is **done** for admin user detail (`/_admin/users/[id]`, P3-16). Several admin actions are **UI placeholders** because mutations/queries are missing or behave incorrectly.

**Your mission:** Implement every gap listed in **IN SCOPE** below. Mark each `GAP-*` as `DONE` in `BACKEND_GAPS.md` (FixoraF copy) after implementation + tests. No half-implementations.

### Explicitly OUT OF SCOPE — do NOT build

| ID | Reason |
|----|--------|
| **GAP-050** Apple OAuth | Product decision: no paid Apple Sign In integration now. Backend may keep stub; FixoraF UI stays "Coming Soon". |
| **GAP-051** Real KakaoPay gateway | Keep **mock** `initiatePayment` → `confirmPayment` (PAY-05). No production PSP, no KakaoPay API keys, no webhooks. |
| **GAP-041** `ON_SITE` booking flow | MVP is **SHOP_VISIT only** (`DECISIONS.md` BIZ-01). Do not enable `createBooking` with `ON_SITE`. Enum may exist for admin filters only. |

Do not add other paid third-party integrations unless already in schema.

### IN SCOPE — must implement 100%

| Priority | IDs | Area |
|----------|-----|------|
| P0 | GAP-110, GAP-111 | Verification queue: `PENDING` technicians |
| P0 | GAP-109 | Admin password reset (secure) |
| P0 | GAP-103, GAP-102 | Revoke verification + Premium badge admin control |
| P1 | GAP-104, GAP-105, GAP-106 | Moderation warnings + login audit + verification notes |
| P1 | GAP-107, GAP-108 | Filter comments/reports by user on admin user detail |
| P2 | GAP-101 | Aggregated `getAdminUserDetail` (performance) |
| P2 | GAP-078 | Admin notifications (optional dedicated query) |
| P2 | GAP-112 | `imageUploader` / `imagesUploader` target `"device"` |

---

## FixoraF context (what UI expects today)

### Route: `/_admin/users/[id]`

FixoraF loads **8 parallel queries** via `useAdminUserDetail`:

- `getUser`
- `getAllBookingsByAdmin` (filter `technicianId` or `userId`)
- `getAllPaymentsByAdmin` (same)
- `getArticles` (`search.userId`)
- `getTechnicianStories` (technician only)
- `getTechnicianReviews` / `getUserReviews`
- `getPublicClientProfile` (customer only)
- `getTechnicianAnalytics` (technician only)

**GAP-101** should replace this with one guarded admin query returning the same shaped payload (or document that parallel queries remain canonical — prefer single query for production).

### Modals: `AdminUserActionModals`

| Action | Current FixoraF behavior | Backend needed |
|--------|------------------------|----------------|
| Suspend | `updateUserByAdmin` → `userStatus: BLOCK` | ✅ works |
| Delete account | `updateUserByAdmin` → `userStatus: DELETE` | Prefer `adminDeleteUser` or reuse `deleteAccount` with admin guard + audit |
| Reset password | **GAP-only modal** — does nothing | **GAP-109** |
| Send warning | **GAP-only** | **GAP-104** |
| Remove verification | **GAP-only** | **GAP-103** |
| Grant / remove Premium | **GAP-only** | **GAP-102** |

**Critical bug:** `updateUserByAdmin` with `userPassword` **corrupts bcrypt hash**. Either reject `userPassword` on admin update or implement **GAP-109** only path for password changes.

### Verification: `/_admin/verification` + user detail section

- **Approve** button shown only when `verificationStatus === UNDER_REVIEW` (correct per AUTH_API).
- **Reject** shown for `PENDING` **and** `UNDER_REVIEW`.
- For `PENDING` reject, backend currently returns: *"Verification cannot be submitted in the current status"* → **GAP-111**.
- **GAP-110:** Optional admin approve from `PENDING` (fast-track without technician `submitTechnicianVerification`) — implement if product allows; at minimum fix **GAP-111**.

Reference: `docs/AUTH_API.md` §9, `libs/utils/adminVerificationActions.ts` error matcher `/cannot be submitted|current status/i`.

---

## Per-gap specification

### GAP-110 — Approve technician from `PENDING` (optional but listed)

**Option A (recommended):** Extend `approveTechnician(userId)`:

- Allow when `verificationStatus` is `UNDER_REVIEW` (existing) **or** `PENDING` with `userType === TECHNICIAN`.
- For `PENDING` without documents: either require `verificationDocuments.length > 0` or allow admin override with audit log entry.
- Set: `verificationStatus: APPROVED`, `badgeLevel: VERIFIED`, `isVerified: true`.

**Option B:** New mutation `approveTechnicianFromPending(userId: String!): User!` — same effect, explicit name.

Update `AUTH_API.md` §9.2 preconditions.

---

### GAP-111 — Reject technician from `PENDING`

Extend `rejectTechnician(userId, reason)`:

- Allow when `verificationStatus` is `UNDER_REVIEW` **or** `PENDING` (incomplete onboarding).
- Effect: `verificationStatus: REJECTED`, `badgeLevel: NEW`, `isVerified: false`, persist `verificationRejectionReason`.
- Use case: admin dismisses abandoned/incomplete technician signups from queue tab `PENDING`.

Must **not** require `submitTechnicianVerification` to have been called.

---

### GAP-102 — Grant / remove Premium badge

`User` already has `badgeLevel: BadgeLevel!` (`NEW | VERIFIED | PREMIUM_PRO`).

Implement **one of**:

```graphql
mutation setTechnicianBadgeLevel(userId: String!, badgeLevel: BadgeLevel!): User!
```

**or** add to `UserUpdate`:

```graphql
input UserUpdate {
  # ...existing fields...
  badgeLevel: BadgeLevel
}
```

Rules:

- Only `ADMIN` may set `PREMIUM_PRO` or revoke to `VERIFIED`/`NEW`.
- Cannot set `VERIFIED` via this mutation if not `APPROVED` — use verification flow.
- Audit log entry on change.

---

### GAP-103 — Revoke technician verification

```graphql
mutation revokeTechnicianVerification(userId: String!, reason: String): User!
```

Effect:

- `verificationStatus` → `NONE` or `REJECTED` (document choice; prefer `REJECTED` with reason for audit)
- `badgeLevel` → `NEW`
- `isVerified` → `false`
- Clear or keep `verificationDocuments` (document: keep for audit, clear `isVerified` only)
- Block `acceptBooking` until re-approved

---

### GAP-104 — Send warning + moderation history

```graphql
mutation warnUser(input: WarnUserInput!): UserModerationEntry!

input WarnUserInput {
  userId: String!
  reason: String!
  category: ModerationCategory  # optional: SPAM, ABUSE, FRAUD, OTHER
}

type UserModerationEntry {
  _id: String!
  userId: String!
  adminId: String!
  action: String!          # WARN, SUSPEND, etc.
  reason: String!
  createdAt: DateTime!
  adminData: User
}

query getUserModerationHistory(userId: String!, limit: Int, page: Int): UserModerationEntries!
```

- Persist in `user_moderation_log` (or extend existing moderation collection).
- Optionally create in-app `Notification` for warned user.
- Distinct from `warnTechnicianForStory` (story-specific) — this is **account-level**.

---

### GAP-105 — Login / audit history

`User.lastLoginAt` exists but admin UI needs **history**.

```graphql
query getUserLoginHistory(userId: String!, input: LoginHistoryInquiry): LoginHistoryPage!

type LoginHistoryItem {
  _id: String!
  userId: String!
  ipAddress: String
  userAgent: String
  authProvider: AuthProvider
  success: Boolean!
  createdAt: DateTime!
}

input LoginHistoryInquiry {
  page: Int!
  limit: Int!
}
```

Implement:

- Record row on successful `login`, `loginWithOAuth`, `refreshToken` (optional), failed login attempts (optional).
- Hook in auth service; index `{ userId: 1, createdAt: -1 }`.
- `ADMIN` only.

---

### GAP-106 — Verification timeline + admin notes

Add to `User` (or separate `VerificationAudit` collection):

```graphql
type User {
  verificationAdminNotes: String      # latest note
  verificationTimeline: [VerificationAuditEntry!]
}

type VerificationAuditEntry {
  action: String!       # SUBMITTED, APPROVED, REJECTED, REVOKED, NOTE
  adminId: String
  note: String
  createdAt: DateTime!
}
```

Mutations `approveTechnician`, `rejectTechnician`, `revokeTechnicianVerification`, `submitTechnicianVerification` must append timeline entries.

Optional:

```graphql
mutation addVerificationAdminNote(userId: String!, note: String!): User!
```

Expose on `getUser` / `getAdminUserDetail` for FixoraF `AdminUserVerification` section.

---

### GAP-107 — Comments by author (admin user detail)

Extend `ACISearch`:

```graphql
input ACISearch {
  commentStatus: CommentStatus
  text: String
  authorId: String    # NEW — filter comments where author is this user
}
```

`getAllCommentsByAdmin` must filter by `authorId` when provided. FixoraF will call with `search: { authorId: userId }`.

---

### GAP-108 — Story reports received by user

`StoryReport` already has `userId` (story owner). Extend inquiry:

```graphql
input StoryReportsInquiry {
  status: ReportStatus
  userId: String      # NEW — reports where reported user / story owner matches
  page: Int
  limit: Int
}
```

Return paginated `StoryReports` for admin user detail **Content / Moderation** sections.

---

### GAP-109 — Admin reset password

```graphql
mutation adminResetPassword(input: AdminResetPasswordInput!): Boolean!

input AdminResetPasswordInput {
  userId: String!
  newPassword: String!   # min 8 chars, same rules as signup
  notifyUser: Boolean    # optional email notification if mailer exists
}
```

Requirements:

- `ADMIN` only.
- Hash with bcrypt (same as `signup` / `changePassword`).
- **Reject** plain-text `userPassword` on `updateUserByAdmin` — return GraphQL error directing to `adminResetPassword`.
- Increment `refreshTokenVersion` to invalidate sessions.
- Audit log entry.

---

### GAP-101 — Aggregated admin user detail (recommended)

```graphql
query getAdminUserDetail(userId: String!): AdminUserDetail!

type AdminUserDetail {
  user: User!
  bookingStats: AdminUserBookingStats!
  recentBookings: [Booking!]!
  recentPayments: [Payment!]!
  articles: [Article!]!
  stories: [Story!]!
  technicianReviews: [Review!]
  userReviews: [Review!]
  clientProfile: PublicClientProfile
  analytics: TechnicianAnalytics
  moderationHistory: [UserModerationEntry!]!
  loginHistory: [LoginHistoryItem!]!
  verificationTimeline: [VerificationAuditEntry!]!
  commentsByUser: [Comment!]!
  reportsReceived: [StoryReport!]!
}
```

- Single `ADMIN`-guarded resolver; reuse existing services.
- Limits: e.g. 10–20 items per list (match FixoraF `CONTENT_LIMIT` / `BOOKING_LIMIT`).
- FixoraF can migrate from parallel queries later.

---

### GAP-078 — Admin header notifications (optional)

FixoraF `AdminNotificationBell` uses shared `getNotifications` with 60s polling.

**Option A:** Keep shared query — mark GAP-078 `DONE` with note "shared query sufficient".

**Option B (better):**

```graphql
query getAdminNotifications(input: NotificationsInquiry!): Notifications!
```

Filter types relevant to admin: `VERIFICATION`, `REPORT`, `PAYMENT`, `USER_SIGNUP`, etc. Exclude DMs unless admin is participant.

---

### GAP-112 — Device image upload target (FixoraF workaround today)

FixoraF `useDeviceImageUpload.ts` uploads via `imageUploader` with targets `property` / `article` because `"device"` is not whitelisted.

Add `"device"` to `allowedUploadTargets` (same validation as `story`, `article`: size, mime).

```graphql
# No schema change if target is String — document allowed values:
# profile | article | story | property | device | message
```

Store under consistent path e.g. `uploads/devices/{userId}/`.

---

## Cross-cutting production requirements

### Security & guards

- All new operations: `@Roles(UserType.ADMIN)` (or equivalent `RolesGuard`).
- Never expose `userPassword` hash in GraphQL responses.
- Rate-limit `adminResetPassword` and `warnUser`.

### `updateUserByAdmin` hardening

- Strip or reject `userPassword` field (GAP-109).
- Document allowed fields in `BACKEND_ADMIN.md`.

### Admin soft-delete vs `deleteAccount`

- Align `userStatus: DELETE` with `deletedAt` timestamp (FixoraF already reads `deletedAt`).
- Consider `adminDeactivateUser` vs hard delete — match existing `UserStatus` enum.

### Tests (required)

For each new mutation/query:

1. Unit test service logic (status transitions).
2. E2E GraphQL test with ADMIN token:
   - GAP-111: reject `PENDING` technician succeeds.
   - GAP-109: reset password + login with new password works; old token invalid.
   - GAP-102: set `PREMIUM_PRO` persists.
   - GAP-107/108: filters return only target user's data.

### Documentation sync (mandatory before marking done)

Update in **FixoraB** and copy to **FixoraF** `docs/`:

| File | Updates |
|------|---------|
| `schema.gql` | New types, inputs, mutations, queries |
| `FRONTEND_API.md` | Operation names, auth, examples |
| `BACKEND_ADMIN.md` | `/_admin/users/:id` contract |
| `AUTH_API.md` | §9 verification if GAP-110/111 change rules |
| `BACKEND_GAPS.md` | Status → `DONE` for 078, 101–112 |

---

## Suggested implementation order

1. **GAP-111 + GAP-110** — unblocks verification queue (highest user-visible pain).
2. **GAP-109** + block `userPassword` on admin update.
3. **GAP-102, GAP-103** — badge + revoke.
4. **GAP-107, GAP-108** — extend existing admin list filters (small diff).
5. **GAP-104, GAP-105, GAP-106** — new collections + hooks.
6. **GAP-101** — aggregate query (refactor).
7. **GAP-112** — upload whitelist.
8. **GAP-078** — if time; otherwise document shared query as sufficient.

---

## Definition of done

- [ ] All IN SCOPE gaps implemented and tested.
- [ ] OUT OF SCOPE gaps unchanged (mock payment, no Apple, no ON_SITE create).
- [ ] FixoraF `BACKEND_GAPS.md` rows 078, 101–111, 112 updated to `DONE`.
- [ ] No admin flow returns misleading errors for `PENDING` reject.
- [ ] `adminResetPassword` is the only admin password change path.
- [ ] Contract files synced to FixoraF repo.

---

## Handoff back to FixoraF

When complete, notify FixoraF agent:

> Backend gaps GAP-078, 101–112 are DONE. Sync `schema.gql` + `FRONTEND_API.md`. Wire `AdminUserActionModals`, `AdminUserActivity`, `AdminUserContent`, `AdminUserVerification`, `AdminUserModeration` to new operations. Remove `fixora-admin-gap-notice` placeholders. Optional: replace `useAdminUserDetail` parallel queries with `getAdminUserDetail`.
