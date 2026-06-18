# Frontend → Backend Gaps Registry

> **Maqsad:** FixoraF da **dizayn/UI bor**, lekin FixoraB da **logika yoki API yo‘q** bo‘lgan joylarni yagona ro‘yxatda saqlash.  
> **Kim yangilaydi:** Har qanday frontend agent — yangi ekran/mock element ulaganda yoki mock fallback qo‘yganda shu faylga qator qo‘shadi.  
> **Backend agent:** FixoraB da ish boshlashdan oldin shu ro‘yxatni o‘qiydi; band hal qilinganda `Status` ni `DONE` qiladi va `FRONTEND_API.md` / `schema.gql` ni sync qiladi.

**Bog‘liq hujjatlar:**
- GraphQL kontrakt: [`FRONTEND_API.md`](FRONTEND_API.md), [`schema.gql`](schema.gql)
- Qarorlar: [`DECISIONS.md`](DECISIONS.md)
- Search audit (alohida): [`backend-search-gaps-prompt.md`](backend-search-gaps-prompt.md)

---

## Status belgilari

| Status | Ma'nosi |
|--------|---------|
| `MISSING` | Backendda model/query/mutation umuman yo‘q |
| `PARTIAL` | Schema yoki maydon bor, lekin to‘liq ishlamaydi yoki noto‘g‘ri |
| `WORKAROUND` | Frontend vaqtincha hack/mock/localStorage bilan yopilgan |
| `MOCK` | Ataylab mock (masalan PAY-05 to‘lov gateway) |
| `DONE` | Backend tayyor; frontend hali yangilanmagan bo‘lishi mumkin |

---

## Agent protokoli (kelajak uchun)

Yangi UI element qo‘shganda:

1. Backend API bormi? — `schema.gql` + `FRONTEND_API.md` dan tekshir.
2. Yo‘q bo‘lsa — **shu faylga yangi qator** qo‘sh (ID keyingi raqam).
3. Frontendda **mock fallback** qoldir (dizayn buzilmasin).
4. Kodda qisqa izoh: `// BACKEND_GAPS: GAP-XXX`
5. Backend tayyor bo‘lganda — workaround olib tashla, statusni `DONE` qil.

---

## Ro‘yxat

### Analytics — `/technician/analytics`

| ID | UI element | Backend kerak | Nega kerak | Hozirgi frontend | Status | Fayl |
|----|------------|---------------|------------|------------------|--------|------|
| GAP-001 | **Avg Response** KPI (`11m`, `-4m`) | Technician o‘rtacha javob vaqti: masalan `User.avgResponseMinutes` yoki `getTechnicianAnalytics` aggregation (birinchi xabar/booking qabul vaqti oralig‘i) | Analytics mockupida alohida KPI; technician ishonchliligi ko‘rsatkichi | Statik mock qiymat | `MISSING` | `pages/technician/analytics/index.tsx` |
| GAP-002 | **Top Performer** KPI (`Top 3%`) | Platforma bo‘yicha reyting/percentile: `getTechnicianRank` yoki leaderboard query | Raqobat motivatsiyasi; mockupda badge bor | Statik `Top 3%` | `MISSING` | `pages/technician/analytics/index.tsx` |
| GAP-003 | KPI **trend** badge (`+12%`, `+3%`, …) | Oldingi davr bilan taqqoslash API (bookings/reviews bo‘yicha period-over-period) | Mockupda har KPI ostida trend ko‘rsatkich | Ko‘p joyda statik trend; ba’zi hisob-kitob bookingdan | `PARTIAL` | `pages/technician/analytics/index.tsx` |
| GAP-004 | **Revenue by Repair Type → Camera** | `IssueCategory` da `CAMERA` yoki AI classification kengaytmasi | Mockupda 6 ta repair turi; schema da Camera yo‘q | `KEYBOARD`/`SOFTWARE` → Logic, Camera faqat mockda | `PARTIAL` | `libs/utils/technicianMetrics.ts`, `schema.gql` `IssueCategory` |

**Ishlaydi (real data):** Total Jobs, Completion Rate, Repeat Clients, Avg Rating, Jobs vs Revenue chart, Repairs by Device, Revenue by Repair Type (mavjud category), Rating Trend, Top Clients — `getTechnicianBookings`, `getUser`, `getTechnicianReviews`.

---

### Earnings & Payouts — `/technician/earnings`

| ID | UI element | Backend kerak | Nega kerak | Hozirgi frontend | Status | Fayl |
|----|------------|---------------|------------|------------------|--------|------|
| GAP-010 | **Request Payout** tugma | `requestPayout(input)` mutation + payout workflow | Technician daromadini yechib olish | Toast: "Payout requests coming soon" | `MISSING` | `pages/technician/earnings/index.tsx` |
| GAP-011 | **Withdraw Now** + **Available Balance** | `Payout` / `WalletBalance` modeli; available vs pending ajratish | Mockupda balans kartochkasi | `DEMO_KRW.availableBalance` mock | `MISSING` | `pages/technician/earnings/index.tsx` |
| GAP-012 | **Next Payout** stat + sana | Avtomatik payout jadvali (`nextPayoutAt`, `estimatedAmount`) | Technician cashflow rejalashtirish | Mock sana + summa | `MISSING` | `pages/technician/earnings/index.tsx` |
| GAP-013 | **Payout History** ro‘yxati | `getMyPayouts` — amount, bank/KakaoPay account, completedAt, duration | Mockupda o‘tgan to‘lovlar tarixi | `DEMO_PAYOUTS` mock (KakaoPay) | `MISSING` | `pages/technician/earnings/index.tsx` |
| GAP-014 | **Monthly Payouts** (to‘liq ma'noda) | Oyma-oy **haqiqiy payout** yozuvlari (`Payout` entity), faqat `Payment` emas | Bar chart "payout" deyiladi; hozir completed payment/booking yig‘indisi | `getMyPayments` + booking fallback; payout modeli yo‘q | `PARTIAL` | `pages/technician/earnings/index.tsx`, `apollo/user/profile.ts` |

**Ishlaydi (real data):** Total Earned, Pending (booking + `getMyPayments`), This Month, Daily Earnings chart, Transactions list — `getTechnicianBookings`, `getMyPayments`.

**Eslatma:** `getMyPayments` mavjud (`schema.gql`), lekin alohida **Payout** entity yo‘q (GAP-010…013).

---

### Technician Dashboard — `/technician/dashboard`

| ID | UI element | Backend kerak | Nega kerak | Hozirgi frontend | Status | Fayl |
|----|------------|---------------|------------|------------------|--------|------|
| GAP-020 | **Today's Schedule → Add** (custom items) | `TechnicianSchedule` CRUD: `createScheduleItem`, `getMySchedule`, `deleteScheduleItem` | Technician bookingdan tashqari vaqt bloklarini saqlashi | `localStorage` (`fixora_tech_schedule_<userId>`) — faqat shu qurilmada | `MISSING` | `pages/technician/dashboard.tsx`, `libs/components/technician/AddScheduleModal.tsx` |
| GAP-021 | **Export Report** | `exportEarningsReport(period)` — CSV/PDF yoki signed URL | Quick action mockupida bor | Faqat `/technician/earnings` ga navigate | `PARTIAL` | `pages/technician/dashboard.tsx` |

**Ishlaydi:** Weekly Earnings chart, booking-based schedule items, Mark Available (`updateUser.isOnline`), incoming requests, active jobs.

---

### Public profiles

| ID | UI element | Backend kerak | Nega kerak | Hozirgi frontend | Status | Fayl |
|----|------------|---------------|------------|------------------|--------|------|
| GAP-030 | **Response time** (`<15m`, `~15m response`) | `User.avgResponseMinutes` yoki computed field | Search va technician profile mockupida ishonch signali | Statik matn (DECISIONS UI-09) | `MISSING` | `pages/technician/profile/index.tsx`, search cards |
| GAP-031 | **Client reviews on `/member`** | Public `getUserReviews(userId)` — client yozgan reviewlar | BIZ-05: client faqat review yozadi, article emas | 40 ta technician scan + `getTechnicianReviews` filter (`userId`) — sekin, noto‘g‘ri scale | `MISSING` | `libs/components/member/CustomerReviewsSection.tsx` |
| GAP-032 | **Followers/Reviews count** (header) | `User.followersCount` / `User.reviewCount` real-time sync | Count fieldlar seeded/stale | `metaCounter[0].total` list querydan olinadi (workaround) | `PARTIAL` | `pages/technician/profile/index.tsx`, DECISIONS UI-09 |

---

### Search & discovery — `/search`, `/technicians/[id]`

| ID | UI element | Backend kerak | Nega kerak | Hozirgi frontend | Status | Fayl |
|----|------------|---------------|------------|------------------|--------|------|
| GAP-040 | Search filters to‘liq ishlashi | `getTechnicians` filter implementation audit | P3-05 search sahifasi | Ba’zi filterlar backendda tasdiqlanmagan | `PARTIAL` | [`backend-search-gaps-prompt.md`](backend-search-gaps-prompt.md) |
| GAP-041 | **ON_SITE** booking | `BookingType.ON_SITE` flow + technician on-site dispatch | Mockupda "Coming Soon" | UI faqat badge; MVP `SHOP_VISIT` (BIZ-01) | `MISSING` | Booking UI, DECISIONS BIZ-01 |

---

### Auth & payments (global)

| ID | UI element | Backend kerak | Nega kerak | Hozirgi frontend | Status | Fayl |
|----|------------|---------------|------------|------------------|--------|------|
| GAP-050 | **Apple OAuth** | Apple provider to‘liq config + `loginWithOAuth(APPLE)` | AUTH-02 mockup/schema | "Coming Soon" badge | `PARTIAL` | `libs/components/auth/SocialAuthRow.tsx` |
| GAP-051 | **Real payment gateway** | KakaoPay production API (hozir mock) | Production to‘lov | Mock `initiatePayment` → `confirmPayment` (PAY-05) | `MOCK` | DECISIONS BIZ-03, `FRONTEND_API.md` |

---

### Notifications & social

| ID | UI element | Backend kerak | Nega kerak | Hozirgi frontend | Status | Fayl |
|----|------------|---------------|------------|------------------|--------|------|
| GAP-060 | **Follow notifications** (eski followerlar) | Tarixiy FOLLOW notification backfill yoki `getUserFollowers` notification feedda | Eski followlar uchun notification record yaratilmagan | `getUserFollowers` dan synthetic notification (workaround) | `WORKAROUND` | `pages/technician/notifications/index.tsx` |

---

### Admin (kelajak)

| ID | UI element | Backend kerak | Nega kerak | Hozirgi frontend | Status | Fayl |
|----|------------|---------------|------------|------------------|--------|------|
| GAP-070 | **Technician verification queue** | Admin `getTechnicianVerificationQueue`, approve/reject | Onboarding `/register/technician/pending` | Admin UI incremental (P3-15) | `PARTIAL` | `docs/design/admin/README.md` |

---

## Ustuvorlik (tavsiya)

| Priority | ID lar | Sabab |
|----------|--------|-------|
| **P0** | GAP-031, GAP-010…014 | Client profile va pul oqimi — biznes jihatdan muhim |
| **P1** | GAP-020, GAP-001, GAP-030, GAP-040 | Dashboard schedule, analytics ishonch, search |
| **P2** | GAP-002, GAP-003, GAP-004, GAP-021, GAP-032 | Nice-to-have metrics va export |
| **P3** | GAP-050, GAP-041, GAP-051 | Phase 2+ (Apple, ON_SITE, real payments) |

---

## FixoraB uchun minimal API takliflari (qisqa)

```graphql
# GAP-031 — Client public reviews
getUserReviews(input: ReviewsInquiry!): TechnicianReviews!

# GAP-020 — Technician schedule
getMySchedule(input: ScheduleInquiry!): ScheduleItems!
createScheduleItem(input: ScheduleItemInput!): ScheduleItem!
deleteScheduleItem(scheduleItemId: String!): ScheduleItem!

# GAP-010…013 — Payouts
getMyPayouts(input: PayoutsInquiry!): Payouts!
requestPayout(input: RequestPayoutInput!): Payout!
getWalletBalance: WalletBalance!

# GAP-001, GAP-030 — Response time
# User.avgResponseMinutes: Float  OR  getTechnicianAnalytics(technicianId): AnalyticsSummary

# GAP-002 — Ranking
getTechnicianRank(technicianId: String!): TechnicianRank  # e.g. percentile, badge
```

---

## O‘zgarishlar tarixi

| Sana | Agent | O‘zgarish |
|------|-------|-----------|
| 2026-06-18 | Cursor | Dastlabki registry: Analytics, Earnings, Dashboard, Member reviews, Search, Notifications |
