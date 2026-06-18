# FixoraB — Technician Settings (backend spec)

> **Repo:** `FIXORAB` / `FixoraB`  
> **Frontend:** `FixoraF` — `/technician/settings` (8 sections)  
> **Related gaps:** GAP-090…096 in [BACKEND_GAPS.md](./BACKEND_GAPS.md)

---

## Frontend status (FixoraF)

| Section | Wired to GraphQL | Notes |
|---------|------------------|-------|
| Profile Settings | **Yes** | `getUser` + `updateUser` + `imageUploader(target:"user")` |
| Account | **Partial** | `userNickname` via `updateUser`; `badgeLevel` read-only |
| Notifications | **Pending** | GAP-092 — empty state in UI |
| Security (password) | **Partial** | `updateUser.userPassword` — no current-password verify (GAP-090) |
| Security (2FA) | **Pending** | GAP-091 |
| Payment Methods | **Pending** | GAP-093 (+ GAP-010…014 payouts) |
| Availability | **Yes** | `updateUser.workingHours` |
| Preferences | **Pending** | GAP-094 |
| Delete Account | **Pending** | GAP-095 |

---

## Already in schema (use today)

### `getUser(userId: String!)`

Fields used by settings UI:

- `userEmail`, `userFullName`, `userNickname`, `userPhoneNumber`
- `userLocation`, `userBio`, `userProfileImage`
- `badgeLevel`, `userType`
- `workingHours { days, startTime, endTime }`

### `updateUser(input: UserUpdate!)`

Writable from settings:

- `userFullName`, `userNickname`, `userPhoneNumber`, `userLocation`, `userBio`
- `userProfileImage`, `userPassword`
- `workingHours: UserWorkingHoursInput`

### `imageUploader(file: Upload!, target: String!)`

Frontend uses `target: "user"` for profile avatar. Confirm allowed targets in FIXORAB (legacy: `"member"`, `"article"`, `"story"`).

---

## GAP-090 — Change password with verification

**Problem:** `UserUpdate.userPassword` has no `currentPassword` check.

```graphql
mutation ChangePassword($input: ChangePasswordInput!) {
  changePassword(input: $input) { success message }
}

input ChangePasswordInput {
  currentPassword: String!
  newPassword: String!
}
```

---

## GAP-091 — Two-Factor Authentication

UI: Authenticator App, Email Verification, SMS Code toggles.

```graphql
type TwoFactorStatus {
  authenticatorEnabled: Boolean!
  emailEnabled: Boolean!
  smsEnabled: Boolean!
}

query getTwoFactorStatus: TwoFactorStatus!
mutation enableTwoFactor(method: TwoFactorMethod!): TwoFactorSetupPayload!
mutation disableTwoFactor(method: TwoFactorMethod!): Boolean!
mutation verifyTwoFactorCode(method: TwoFactorMethod!, code: String!): Boolean!

enum TwoFactorMethod { AUTHENTICATOR EMAIL SMS }
```

---

## GAP-092 — Notification preferences

7 toggles in mockup:

1. New Repair Requests  
2. New Messages  
3. Payment Received  
4. New Reviews  
5. Job Status Updates  
6. Weekly Earnings Report  
7. Tips & Promotions  

```graphql
type NotificationPreferences {
  newRepairRequests: Boolean!
  newMessages: Boolean!
  paymentReceived: Boolean!
  newReviews: Boolean!
  jobStatusUpdates: Boolean!
  weeklyEarningsReport: Boolean!
  tipsAndPromotions: Boolean!
}

query getNotificationPreferences: NotificationPreferences!
mutation updateNotificationPreferences(input: NotificationPreferencesInput!): NotificationPreferences!
```

---

## GAP-093 — Saved payment methods

```graphql
type PaymentMethodRecord {
  _id: String!
  type: PaymentMethodType!   # BANK, PAYPAL, ...
  label: String!
  last4: String
  isPrimary: Boolean!
}

enum PaymentMethodType { BANK PAYPAL KAKAOPAY }

query getPaymentMethods: [PaymentMethodRecord!]!
mutation addPaymentMethod(input: AddPaymentMethodInput!): PaymentMethodRecord!
mutation deletePaymentMethod(id: String!): Boolean!
mutation setPrimaryPaymentMethod(id: String!): PaymentMethodRecord!
```

Related: **GAP-010…014** (payouts / wallet).

---

## GAP-094 — User preferences

```graphql
type UserPreferences {
  darkMode: Boolean!
  showEarningsPublicly: Boolean!
  autoAcceptRequests: Boolean!
  distanceRadiusAlerts: Boolean!
}

query getUserPreferences: UserPreferences!
mutation updateUserPreferences(input: UserPreferencesInput!): UserPreferences!
```

MVP ships dark-only — `darkMode` may stay `true` until Phase 5 light theme.

---

## GAP-095 — Delete account

```graphql
mutation deleteAccount(confirmation: String!): DeleteAccountResult!

type DeleteAccountResult {
  success: Boolean!
  message: String
}
```

Rules:

- Require exact confirmation string: `DELETE MY ACCOUNT`
- Block if active bookings / pending payouts
- Soft-delete via `userStatus: DELETE` + `deletedAt`
- Invalidate refresh tokens / logout all sessions

---

## GAP-096 — Profile URL slug & email update

- Public URL: `fixora.io/tech/{slug}` — today mapped to `userNickname`
- Optional dedicated `userSlug` with uniqueness validation
- `updateEmail(newEmail, password)` + verification flow

---

## FixoraF sync checklist

After FIXORAB merge:

1. Update `docs/schema.gql`, `docs/FRONTEND_API.md`
2. Add operations in `apollo/user/settings.ts`
3. Replace `SettingsEmptyBackend` sections with live queries/mutations
4. Remove GAP hint copy from Security password form when GAP-090 done

---

## O'zgarishlar tarixi

| Sana | Agent | O'zgarish |
|------|-------|-----------|
| 2026-06-19 | Cursor | Initial spec GAP-090…096 for technician settings module |
