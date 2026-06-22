# Fixora — Settings API (Phase 4)

> **Status:** Implemented (GAP-090…096) — 2026-06-22  
> **Auth:** Bearer on all operations  
> **Module:** `SettingsModule`

---

## Security

```graphql
mutation ChangePassword($input: ChangePasswordInput!) {
  changePassword(input: $input)
}
```

| Field | Required |
|-------|----------|
| `currentPassword` | Yes |
| `newPassword` | Yes (5–12 chars) |

Errors: `WRONG_PASSWORD`, session tokens invalidated via `refreshTokenVersion` bump.

---

## Account

```graphql
mutation UpdateEmail($input: UpdateEmailInput!) { updateEmail(input: $input) { _id userEmail } }
mutation UpdateUserSlug($input: UpdateUserSlugInput!) { updateUserSlug(input: $input) { _id userSlug } }
mutation DeleteAccount($input: DeleteAccountInput!) { deleteAccount(input: $input) }
```

| Operation | Notes |
|-----------|-------|
| `updateEmail` | Unique email check |
| `updateUserSlug` | Lowercase `[a-z0-9-]{3,40}` |
| `deleteAccount` | `confirmation` must be `"DELETE"`; soft-delete user |

---

## Two-factor authentication (TOTP)

```graphql
mutation Enable2FA { enable2FA { secret provisioningUri } }
mutation Verify2FASetup($input: VerifyTwoFactorInput!) { verify2FASetup(input: $input) }
mutation Disable2FA($input: DisableTwoFactorInput!) { disable2FA(input: $input) }
query GetTwoFactorStatus { getTwoFactorStatus }
```

Flow: `enable2FA` → user scans QR / enters secret → `verify2FASetup(code)` → `twoFactorEnabled: true`.

---

## Preferences

```graphql
query GetNotificationPreferences { getNotificationPreferences { bookingUpdates messages payments reviews marketing followAlerts emailDigest } }
mutation UpdateNotificationPreferences($input: NotificationPreferencesInput!) { updateNotificationPreferences(input: $input) { ... } }

query GetUserPreferences { getUserPreferences { language currency timezone darkMode } }
mutation UpdateUserPreferences($input: UserPreferencesInput!) { updateUserPreferences(input: $input) { ... } }
```

Stored embedded on `users.notificationPreferences` / `users.userPreferences`.

---

## Saved payment methods

Collection: `user_payment_methods` (operational, not ER entity).

```graphql
query GetPaymentMethods { getPaymentMethods { list { _id methodLabel methodType maskedNumber isPrimary } } }
mutation CreatePaymentMethod($input: CreatePaymentMethodInput!) { createPaymentMethod(input: $input) { _id } }
mutation UpdatePaymentMethod($input: UpdatePaymentMethodInput!) { updatePaymentMethod(input: $input) { _id } }
mutation DeletePaymentMethod($paymentMethodId: String!) { deletePaymentMethod(paymentMethodId: $paymentMethodId) }
```

`isPrimary: true` clears primary flag on other methods for the same user.

---

## Related

- [`FRONTEND_API.md`](FRONTEND_API.md) — Settings section
- [`BACKEND_GAPS.md`](BACKEND_GAPS.md) — GAP-090…096
