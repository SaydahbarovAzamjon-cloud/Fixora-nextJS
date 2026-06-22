# Fixora — Payout API (Phase 1)

> **Status:** Implemented (GAP-010…014) — 2026-06-22  
> **Auth:** Bearer + `UserType.TECHNICIAN`  
> **Note:** MVP mock — `requestPayout` immediately marks payout `COMPLETED` (no real bank/KakaoPay transfer). Same pattern as PAY-05 payment mock.

---

## Wallet balance — `getWalletBalance`

```graphql
query GetWalletBalance {
  getWalletBalance {
    availableBalance
    pendingBalance
    totalEarned
    nextPayoutAt
    estimatedAmount
    currency
  }
}
```

| Field | Calculation |
|-------|-------------|
| `totalEarned` | Sum `Payment.paymentAmount` where `paymentStatus: COMPLETED` and `technicianId` = caller |
| `pendingBalance` | Sum `Payment` where `paymentStatus: PENDING` |
| `availableBalance` | `totalEarned` − completed payouts − pending/processing payouts |
| `nextPayoutAt` | First day of next calendar month |
| `estimatedAmount` | Same as `availableBalance` at query time |
| `currency` | `"KRW"` |

---

## Payout history — `getMyPayouts`

```graphql
query GetMyPayouts($input: PayoutsInquiry!) {
  getMyPayouts(input: $input) {
    list {
      _id
      payoutAmount
      payoutStatus
      payoutMethod
      accountLabel
      requestedAt
      completedAt
    }
    metaCounter { total }
  }
}
```

Filters: `search.payoutStatus`, `search.payoutMethod`

---

## Request payout — `requestPayout`

```graphql
mutation RequestPayout($input: RequestPayoutInput!) {
  requestPayout(input: $input) {
    _id
    payoutAmount
    payoutStatus
    payoutMethod
    completedAt
  }
}
```

| Input | Required | Notes |
|-------|----------|-------|
| `payoutMethod` | Yes | `KAKAOPAY`, `BANK_TRANSFER` |
| `payoutAmount` | No | Defaults to full `availableBalance` |
| `accountLabel` | No | Masked account display (e.g. KakaoPay wallet) |

**Errors:** `INSUFFICIENT_PAYOUT_BALANCE`, `INVALID_PAYOUT_AMOUNT`, `TECHNICIAN_ONLY`

---

## Client reviews — GAP-031 `getUserReviews`

Public query — reviews **written by** a customer (`UserType.USER`):

```graphql
query GetUserReviews($input: UserReviewsInquiry!) {
  getUserReviews(input: $input) {
    list {
      _id
      repairQuality
      repairSpeed
      communication
      reviewContent
      createdAt
      technicianData { _id userNickname userProfileImage }
      deviceData { deviceModel deviceCategory }
    }
    metaCounter { total }
  }
}
```

Empty list returns `{ list: [], metaCounter: [{ total: 0 }] }` — not an error.

---

## Collection

`payouts` — operational (not ER-12 entity); mirrors payment mock scope.
