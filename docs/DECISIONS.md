# Fixora — Approved Decisions

> **Do not contradict these.** Update this file only when the user explicitly approves a change.  
> **Repo:** FixoraF (frontend). Shared by **Cursor** and **Codex** — same rules apply.  
> Backend implementation of these decisions lives in **FIXORAB**.

**Last updated:** 2026-05-31

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

| ID | Decision |
|----|----------|
| AUTH-01 | MVP providers: **`PHONE` \| `KAKAO` only** |
| AUTH-02 | Future (not MVP): `EMAIL`, `APPLE`, `GOOGLE` |
| AUTH-03 | Login via phone + password, or Kakao OAuth (`kakaoId` on user) |
| AUTH-04 | Sign-up flow: Choose Role → Customer (immediate access) or Technician (6-step onboarding) |
| AUTH-05 | Technician verification: `verificationStatus` PENDING → UNDER_REVIEW → APPROVED |
| AUTH-06 | Badges: `NEW` → `VERIFIED` (admin approve) → `PREMIUM_PRO` (future) |

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
| UI-06 | Theme: dark, orange primary, dark glass cards |

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

## Out of Scope (MVP)

- ON_SITE repair
- Email / Apple / Google auth
- SMS / KakaoTalk notifications (future)
- Advanced AI diagnostics
- Live tracking
- Separate admin UI design (build incrementally)
