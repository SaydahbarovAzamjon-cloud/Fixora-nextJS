# FixoraF — Backend Sync & Wiring Guide

> **Maqsad:** FixoraB Phase 0–4 backend tayyor. FixoraF agent bu checklist bo‘yicha mock/workaround olib, real GraphQL ga ulaydi.  
> **Last updated:** 2026-06-22

---

## 1. Fayllarni nusxala

| FixoraB manba | FixoraF joyi |
|---------------|--------------|
| `docs/schema.gql` | `docs/schema.gql` |
| `docs/BACKEND_GAPS.md` | `docs/BACKEND_GAPS.md` |
| `docs/FRONTEND_API.md` | `docs/FRONTEND_API.md` |
| `docs/BACKEND_ADMIN.md` | admin contract |
| `docs/PAYOUT_API.md` | earnings |
| `docs/BACKEND_SETTINGS.md` | settings |

`NEXT_PUBLIC_GRAPHQL_URL` → FixoraB API (`http://localhost:2000/graphql` dev).

---

## 2. Phase 0 — Admin (GAP-071…077)

| Sahifa | Query / Mutation |
|--------|------------------|
| `/_admin` | `getAdminDashboardStats`, `getAdminRecentActivity`, `getAdminPaymentSummary` |
| `/_admin/verification` | `getTechnicianVerificationQueue` + `verificationStatus` filter |
| `/_admin/payments` | `getAdminPaymentSummary` |
| `/_admin/moderation` | `getAllCommentsByAdmin` |
| `/_admin/settings` | `getAdminPlatformSettings`, `updateAdminPlatformSettings` |
| Admin header | `adminGlobalSearch` |

Mock banner va `—` placeholderlarni olib tashlang.

---

## 3. Phase 1 — Earnings + client reviews

| Sahifa | API |
|--------|-----|
| `/technician/earnings` | `getWalletBalance`, `getMyPayouts`, `requestPayout` |
| `/member` reviews | `getUserReviews(input)` |

`DEMO_KRW`, `DEMO_PAYOUTS`, technician review scan workaround → olib tashlash.

---

## 4. Phase 2 — Analytics + schedule + search

| Sahifa | API |
|--------|-----|
| `/technician/analytics` | `getTechnicianAnalytics`, `getTechnicianRank` |
| `/technician/dashboard` schedule | `getMySchedule`, `createScheduleItem`, `deleteScheduleItem` |
| Search / profile | `User.avgResponseMinutes`, `getTechnicians` + `maxAvgResponseMinutes` |
| `/technicians` fast row | `sort: avgResponseMinutes` yoki filter ≤15 |

`localStorage` schedule → server CRUD.

---

## 5. Phase 3 — Discovery + community + export

| Sahifa | API |
|--------|-----|
| `/technicians` stats | `getTechnicianPlatformStats` |
| `/technicians` trending | `getTechnicianTrending` |
| Write article | `createArticle` + SEO/visibility/featured fields |
| `/community` | `saveArticle`, `unsaveArticle`, `incrementArticleView` |
| Dashboard export | `exportEarningsReport` → CSV base64 decode |

Client-side trending/score workaround → server query.

---

## 6. Phase 4 — Messages + notif + settings + social

| Sahifa | API |
|--------|-----|
| `/messages` | `uploadMessageImage`, `getMessages` (peer merge), `deviceLabel` on conversations |
| Notifications | `deleteNotification`, filter `PAYMENT` |
| `/technician/settings` | `SettingsModule` — see [`BACKEND_SETTINGS.md`](BACKEND_SETTINGS.md) |
| Saved technicians | `getUserLikedTechnicians` |
| `/technician/client/[id]` | `getPublicClientProfile` |

---

## 7. Phase 5 — hali to‘liq emas

| Gap | Holat | Sabab |
|-----|-------|-------|
| GAP-050 Apple OAuth | ✅ FixoraB + `fixora-web` | `APPLE_CLIENT_ID` + `NEXT_PUBLIC_APPLE_CLIENT_ID` kerak |
| GAP-041 ON_SITE | ⏸ | `DECISIONS.md` BIZ-01 — MVP faqat SHOP_VISIT |
| GAP-051 Real KakaoPay | ⏸ | `DECISIONS.md` PAY-05 — mock gateway MVP |

---

## 8. Registry yangilash

Har bir sahifa ulangach FixoraF `BACKEND_GAPS.md` da status → `DONE` (FixoraF wired).

Agent xabari namunasi: `GAP-071 done, dashboard ulab ber`
