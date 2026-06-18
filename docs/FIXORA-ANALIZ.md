# Fixora — Project Analysis Document

> **Date:** May 30, 2026  
> **Scope:** Current codebase + Fixora Master Context comparison  
> **Purpose:** MVP development roadmap and transformation plan  
> **Superseded (2026-06-18):** §1/§3 backend status and auth enums reflect **pre-MVP** state. **Current authority:** `DECISIONS.md` (AUTH-*), `FRONTEND_API.md`, `AUTH_API.md`, `schema.gql`, `AI_HANDOFF.md`. §9 UI mockups remain valid; §9 auth API details → use `AUTH_API.md`.

---

## 1. Executive Summary

Fixora is an AI-powered Apple device repair marketplace designed for South Korea. Fixora is **not** a repair company — it connects customers with verified repair technicians.

**Current state:** The repository is built on a `nestar` real estate platform backend skeleton. A NestJS + GraphQL + MongoDB monorepo structure exists, but it has not yet been transformed into the Fixora domain model. The frontend (Next.js) does not exist yet.

**Conclusion:** Infrastructure is ~40–50% reusable. The domain layer (models, enums, services) must be largely rewritten.

---

## 2. Project Identity

| Field | Value |
|-------|-------|
| **Product** | AI-powered Apple device repair marketplace |
| **Market** | South Korea |
| **Supported devices** | iPhone, MacBook, iPad, Apple Watch |
| **Business model** | Platform commission on repair transactions |
| **Core values** | Trust, transparency, simplicity, scalability, UX |

---

## 3. Current Codebase Analysis

### 3.1 Monorepo Structure

```
FixoraB/
├── apps/
│   ├── nestar-api/       # GraphQL API (NestJS)
│   └── nestar-batch/     # Scheduled batch jobs
├── uploads/              # File uploads (member, property, article)
├── package.json          # Project name: "nestar"
└── nest-cli.json
```

| Application | Status | Description |
|-------------|--------|-------------|
| `nestar-api` | ✅ Working | GraphQL API, WebSocket, Auth |
| `nestar-batch` | ✅ Working | Ranking batch jobs (real estate focused) |
| Frontend (Next.js) | ❌ Missing | Defined in Master Context, not yet created |

### 3.2 Current Backend Modules

| Module | Status | Fixora Equivalent |
|--------|--------|-------------------|
| `AuthModule` | ✅ Partially ready | JWT exists, Refresh Token missing |
| `MemberModule` | ✅ Exists | → Convert to `UserModule` |
| `PropertyModule` | ✅ Exists (real estate) | → Remove / replace with `DeviceModule` + `BookingModule` |
| `BoardArticleModule` | ✅ Exists | → `ArticleModule` (technician articles) |
| `CommentModule` | ✅ Exists | ✅ Reusable |
| `FollowModule` | ✅ Exists | ✅ Reusable |
| `LikeModule` | ✅ Exists | ✅ Reusable |
| `ViewModule` | ✅ Exists | ✅ Reusable |
| `SocketModule` | ⚠️ Prototype | Global chat; not booking-based |
| `NotificationModule` | ❌ Schema only, no module | To be created |
| `BookingModule` | ❌ Missing | To be created |
| `DeviceModule` | ❌ Missing | To be created |
| `ReviewModule` | ❌ Missing | To be created |
| `PaymentModule` | ❌ Missing | To be created |
| `MessageModule` | ❌ Missing | To be created |

### 3.3 Current MongoDB Schemas

| Current Schema | Collection | Fixora Status |
|----------------|------------|---------------|
| `Member.model.ts` | `members` | → Redesign as `User` |
| `Property.model.ts` | `properties` | ❌ Remove (real estate domain) |
| `BoardArticle.model.ts` | `boardArticles` | → Rename to `Article` |
| `Comment.model.ts` | `comments` | ✅ Adaptable |
| `Follow.model.ts` | `follows` | ✅ Adaptable |
| `Like.model.ts` | `likes` | ✅ Adaptable |
| `View.model.ts` | `views` | ✅ Adaptable |
| `Notification.model.ts` | `notifications` | ⚠️ Enums are real estate focused, needs update |
| `Notice.model.ts` | — | Admin announcements; not in Fixora ER |

### 3.4 Current Role Structure vs Fixora

| Current (`MemberType`) | Fixora Role | Action |
|------------------------|-------------|--------|
| `USER` | `USER` (Customer) | ✅ Keep |
| `AGENT` | `TECHNICIAN` | Rename + extend |
| `ADMIN` | `ADMIN` | ✅ Keep |

### 3.5 Current Auth Status

| Feature | Status |
|---------|--------|
| Register (`signup`) | ✅ Exists |
| Login | ✅ Exists |
| Logout | ❌ Missing (client-side token removal only) |
| JWT Authentication | ✅ Exists (`AuthService.createToken`) |
| Refresh Token | ❌ Missing |
| Role Based Access | ✅ Exists (`RolesGuard`, `AuthGuard`) |
| bcrypt encryption | ✅ Exists |

### 3.6 Current WebSocket Status

The existing `SocketGateway` is a global chat room implementation:

- Last 5 messages kept in memory (not persisted to DB)
- No booking association
- No phone number visibility rules
- No technician–customer 1:1 chat

**Fixora requirement:** Booking-based, persistent, DB-backed messaging.

---

## 4. Fixora ER Model

> **§4.1–4.8** = original ER diagram (reference only)  
> **§4.9–4.10** = **final approved model** — use for implementation

### 4.1 Entity Count Summary

| Metric | Count |
|--------|-------|
| **Total entities (tables/collections)** | **12** |
| Core transactional entities | 5 (user, device, booking, payment, review) |
| Social / content entities | 4 (article, comment, like, view) |
| Communication entities | 2 (message, notification) |
| Social graph entity | 1 (following) |
| **Total fields (all entities)** | **113** |
| Entities with soft delete (`deletedAt`) | 3 (device, booking, article) |
| Junction / engagement entities | 3 (like, view, comment) |

### 4.2 Entity Inventory

| # | Entity | Fields | PK | FK References |
|---|--------|--------|----|---------------|
| 1 | `user` | 19 | `_id` | — (central hub) |
| 2 | `device` | 14 | `_id` | `userId` → user |
| 3 | `booking` | 16 | `_id` | `userId` → user, `deviceId` → device |
| 4 | `payment` | 8 | `_id` | `userId` → user, `bookingId` → booking |
| 5 | `review` | 7 | `_id` | `userId` → user, `bookingId` → booking, `technicianId` → user |
| 6 | `article` | 13 | `_id` | `userId` → user |
| 7 | `comment` | 7 | `_id` | `userId` → user, `articleId` → article |
| 8 | `like` | 4 | `_id` | `userId` → user, `articleId` → article |
| 9 | `view` | 4 | `_id` | `userId` → user, `articleId` → article |
| 10 | `message` | 8 | `_id` | `senderId` → user, `receiverId` → user, `bookingId` → booking |
| 11 | `following` | 5 | `_id` | `userId` → user, `followerId` → user, `followingId` → user |
| 12 | `notification` | 8 | `_id` | `userId` → user, `receiverId` → user |

### 4.3 Relationship Diagram

```
                              ┌──────────────┐
                              │     user     │  ← Central entity (19 fields)
                              └───┬──┬───┬───┘
                    ┌─────────────┘  │   └─────────────────────────────┐
                    │                │                                 │
              1:N   ▼          1:N   ▼                           1:N   ▼
         ┌────────────┐   ┌────────────┐                    ┌──────────────┐
         │   device   │   │  booking   │◄───────────────────│ notification │
         └─────┬──────┘   └─────┬──────┘                    └──────────────┘
               │                │
               │    ┌───────────┼───────────┬──────────────┐
               │    │           │           │              │
               └───►│  1:N      │  1:N      │  1:N         │  1:N
                    ▼           ▼           ▼              ▼
              (via deviceId) payment    review         message
                                         (technicianId
                                          → user)

         user ──1:N──► article ──1:N──► comment
                    │              ├── like
                    │              └── view

         user ◄──N:M──► user   (via following: followerId / followingId)
```

### 4.4 Entity Field Specifications

#### 1. `user` — 19 fields

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | PK |
| `userType` | enum | USER / TECHNICIAN / ADMIN |
| `userStatus` | enum | ACTIVE, BLOCK, DELETE, etc. |
| `userFullName` | string | |
| `userNickname` | string | Unique display name |
| `userEmail` | string | |
| `userPassword` | string | Hashed, select: false |
| `userPhoneNumber` | string | Hidden until booking accepted |
| `userProfileImage` | string | |
| `userBio` | string | |
| `averageRating` | double | Denormalized from reviews |
| `isVerified` | bool | Admin technician verification |
| `isBlocked` | bool | |
| `followersCount` | int | Denormalized counter |
| `followingCount` | int | Denormalized counter |
| `reviewCount` | int | Denormalized counter |
| `createdAt` | date | |
| `lastLoginAt` | date | |
| `updatedAt` | date | |

#### 2. `device` — 14 fields

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | PK |
| `userId` | ObjectId | FK → user (owner) |
| `deviceCategory` | enum | IPHONE, MACBOOK, IPAD, APPLE_WATCH |
| `deviceBrand` | enum | APPLE (MVP) |
| `deviceModel` | string | e.g. iPhone 15 Pro |
| `deviceSerialNumber` | string | Optional |
| `deviceIssue` | string | Short issue label |
| `deviceDescription` | string | Detailed description |
| `deviceImage` | string | Device photo |
| `deviceStatus` | enum | ACTIVE, IN_REPAIR, etc. |
| `releaseYear` | int | Model year |
| `createdAt` | date | |
| `updatedAt` | date | |
| `deletedAt` | date | Soft delete |

#### 3. `booking` — 16 fields

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | PK |
| `userId` | ObjectId | FK → user (customer) |
| `deviceId` | ObjectId | FK → device |
| `bookingStatus` | enum | PENDING, ACCEPTED, REJECTED, IN_PROGRESS, COMPLETED, CANCELLED |
| `bookingType` | enum | SHOP_VISIT (MVP), ON_SITE (future) |
| `problemTitle` | string | |
| `problemDescription` | string | |
| `estimatedPrice` | double | |
| `finalPrice` | double | Set after repair |
| `isPaid` | bool | Payment completion flag |
| `bookingDate` | date | Scheduled appointment |
| `completedAt` | date | |
| `cancelledAt` | date | |
| `createdAt` | date | |
| `updatedAt` | date | |
| `deletedAt` | date | Soft delete |

> **Note:** ER diagram does not include `technicianId` on booking. Technician association is implied via `review.technicianId` and messaging between users. This may need clarification during implementation.

#### 4. `payment` — 8 fields

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | PK |
| `userId` | ObjectId | FK → user (payer) |
| `bookingId` | ObjectId | FK → booking |
| `paymentMethod` | enum | KAKAOPAY (MVP) |
| `paymentStatus` | enum | PENDING, COMPLETED, FAILED, REFUNDED |
| `paymentAmount` | double | 50% deposit or 50% final |
| `paidAt` | date | |
| `createdAt` | date | |

> **Note:** Two payment records per booking (deposit + final) are modeled as separate rows, not a `paymentType` enum field.

#### 5. `review` — 7 fields

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | PK |
| `userId` | ObjectId | FK → user (reviewer / customer) |
| `bookingId` | ObjectId | FK → booking (COMPLETED only) |
| `technicianId` | ObjectId | FK → user (technician being reviewed) |
| `reviewRating` | double | Single aggregate rating |
| `reviewContent` | string | Optional text + images referenced here |
| `createdAt` | date | |

> **Note:** Master Context defines 3 rating categories (Repair Quality, Repair Speed, Communication). ER diagram uses a single `reviewRating` field. Implementation must clarify whether to extend the schema or compute average from sub-scores stored in `reviewContent`.

#### 6. `article` — 13 fields

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | PK |
| `userId` | ObjectId | FK → user (technician author) |
| `articleCategory` | enum | |
| `articleStatus` | enum | ACTIVE, DELETE, etc. |
| `articleTitle` | string | |
| `articleContent` | string | Rich text (Toast UI Editor) |
| `articleImage` | string | Cover image |
| `articleViews` | int | Denormalized counter |
| `articleLikes` | int | Denormalized counter |
| `articleComments` | int | Denormalized counter |
| `createdAt` | date | |
| `updatedAt` | date | |
| `deletedAt` | date | Soft delete |

#### 7. `comment` — 7 fields

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | PK |
| `userId` | ObjectId | FK → user |
| `articleId` | ObjectId | FK → article |
| `commentContent` | string | |
| `commentStatus` | enum | ACTIVE, DELETE |
| `createdAt` | date | |
| `updatedAt` | date | |

#### 8. `like` — 4 fields

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | PK |
| `userId` | ObjectId | FK → user |
| `articleId` | ObjectId | FK → article |
| `createdAt` | date | Unique index on (userId, articleId) recommended |

#### 9. `view` — 4 fields

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | PK |
| `userId` | ObjectId | FK → user |
| `articleId` | ObjectId | FK → article |
| `createdAt` | date | |

#### 10. `message` — 8 fields

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | PK |
| `senderId` | ObjectId | FK → user |
| `receiverId` | ObjectId | FK → user |
| `bookingId` | ObjectId | FK → booking (chat context) |
| `messageType` | enum | TEXT, IMAGE, etc. |
| `messageContent` | string | |
| `isRead` | bool | |
| `createdAt` | date | |

#### 11. `following` — 5 fields

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | PK |
| `userId` | ObjectId | FK → user |
| `followerId` | ObjectId | FK → user (who follows) |
| `followingId` | ObjectId | FK → user (who is followed) |
| `createdAt` | date | Unique index on (followerId, followingId) recommended |

> **Note:** Three user references (`userId`, `followerId`, `followingId`) appear redundant. `userId` may equal `followerId` — confirm during schema design.

#### 12. `notification` — 8 fields

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | PK |
| `userId` | ObjectId | FK → user (actor / sender) |
| `receiverId` | ObjectId | FK → user (recipient) |
| `notificationType` | enum | BOOKING, MESSAGE, REVIEW, FOLLOW, LIKE, COMMENT |
| `notificationTitle` | string | |
| `notificationDescription` | string | |
| `isRead` | bool | |
| `createdAt` | date | |

### 4.5 Relationship Matrix

| From | To | Cardinality | FK Field | Purpose |
|------|----|-------------|----------|---------|
| user | device | 1:N | device.userId | User owns devices |
| user | booking | 1:N | booking.userId | Customer creates bookings |
| device | booking | 1:N | booking.deviceId | Device linked to repair |
| user | payment | 1:N | payment.userId | User makes payments |
| booking | payment | 1:N | payment.bookingId | Booking has payments (deposit + final) |
| user | review | 1:N | review.userId | Customer writes review |
| booking | review | 1:1 | review.bookingId | One review per completed booking |
| user | review | 1:N | review.technicianId | Technician receives reviews |
| user | article | 1:N | article.userId | Technician publishes articles |
| user | comment | 1:N | comment.userId | User comments on articles |
| article | comment | 1:N | comment.articleId | Article has comments |
| user | like | 1:N | like.userId | User likes articles |
| article | like | 1:N | like.articleId | Article receives likes |
| user | view | 1:N | view.userId | User views articles |
| article | view | 1:N | view.articleId | Article view tracking |
| user | message | 1:N | message.senderId / receiverId | User-to-user chat |
| booking | message | 1:N | message.bookingId | Chat scoped to booking |
| user | following | N:M | following.followerId / followingId | Social follow graph |
| user | notification | 1:N | notification.userId / receiverId | System alerts |

**Total relationships:** 19 distinct relationship paths across 12 entities.

### 4.6 ER Diagram vs Master Context — Gap Analysis

| Topic | ER Diagram | Master Context | Resolution |
|-------|------------|----------------|------------|
| Booking technician | No `technicianId` on booking | Technician accepts/rejects requests | Add `technicianId` to booking OR resolve via separate assignment table — **ER diagram is authoritative; clarify with team** |
| Review ratings | Single `reviewRating` (double) | 3 categories: Quality, Speed, Communication | Extend review schema or store sub-ratings in structured `reviewContent` |
| AI classification | Not in ER | deviceType, issueCategory, repairComplexity | Store in `booking.problemDescription` metadata or extend booking — not in ER, do not add unless approved |
| Technician profile | Only `userBio`, `isVerified` on user | shopName, services, workingHours, certifications | Not in ER — technician extras must live in user fields or require ER update |
| Payment split | Multiple payment rows | 50% deposit + 50% final | Supported via 2 payment records per booking |
| Notification channel | Not in ER | IN_APP + EMAIL | Email delivery is service-layer concern, not stored in notification schema |
| `following.userId` | Present alongside followerId/followingId | follower → following only | Likely redundant; use followerId + followingId only |
| `Notice` entity | Not in ER | Not in Master Context core | Do not implement (current nestar Notice.model.ts is out of scope) |

### 4.7 ER Diagram vs Current Codebase (nestar)

| ER Entity | Current nestar Schema | Match | Action |
|-----------|----------------------|-------|--------|
| user | Member.model.ts | ⚠️ Partial | Rename + add missing fields (averageRating, isVerified, reviewCount) |
| device | — | ❌ Missing | Create from scratch |
| booking | — | ❌ Missing | Create from scratch |
| payment | — | ❌ Missing | Create from scratch |
| review | — | ❌ Missing | Create from scratch |
| article | BoardArticle.model.ts | ⚠️ Partial | Rename fields to match ER naming |
| comment | Comment.model.ts | ✅ Close | Align field names |
| like | Like.model.ts | ✅ Close | Align field names |
| view | View.model.ts | ✅ Close | Align field names |
| message | — | ❌ Missing | Create from scratch |
| following | Follow.model.ts | ⚠️ Partial | Add userId field or confirm redundancy |
| notification | Notification.model.ts | ⚠️ Partial | Replace enums, add receiverId |
| Property | Property.model.ts | ❌ Not in ER | **Remove** |
| Notice | Notice.model.ts | ❌ Not in ER | **Remove** |

**ER coverage in current codebase:** 4 of 12 entities partially exist (33%). 8 entities must be created or fully rewritten.

### 4.8 Design Observations

**Strengths**
- Single `user` table for customers, technicians, and admins — simple RBAC via `userType`
- Denormalized counters (`followersCount`, `articleLikes`, etc.) — good read performance
- Soft delete on device, booking, article — data retention for audit
- Booking as central transaction hub connecting device, payment, review, and message
- Junction tables (like, view, comment) — clean N:M pattern for article engagement

**Risks**
- Missing `technicianId` on booking complicates accept/reject flow and technician job lists
- Single `reviewRating` may not satisfy 3-category review UI from Master Context
- No technician-specific profile fields in ER — public profile data storage unclear
- `following` triple user reference may cause data inconsistency
- `notification` lacks `referenceId` — linking notification to booking/article requires parsing type + description

**Recommended Indexes**

| Collection | Index | Type |
|------------|-------|------|
| user | userEmail, userNickname, userPhoneNumber | unique, sparse |
| device | userId | single |
| booking | userId, deviceId, bookingStatus | compound |
| payment | bookingId | single |
| review | bookingId | unique |
| message | bookingId, createdAt | compound |
| like | userId + articleId | unique compound |
| following | followerId + followingId | unique compound |
| notification | receiverId + isRead | compound |

---

### 4.9 Corrected ER Model — Use This

> **12 entities** — same structure. **7 entities updated**, **5 unchanged**.

#### Changes at a glance

| # | Entity | ❌ Original | ✅ Correct |
|---|--------|-------------|------------|
| 1 | `booking` | no technician link | + `technicianId`, + `progressUpdates[]` |
| 2 | `review` | 1× `reviewRating` | + `repairQuality`, `repairSpeed`, `communication` |
| 3 | `user` | basic profile only | + technician fields (see below) |
| 4 | `payment` | amount only | + `paymentType`, + `transactionId` |
| 5 | `message` | `bookingId` required | `bookingId` **nullable** (pre-booking chat) |
| 6 | `following` | 3 user FKs | remove `userId` — keep `followerId` + `followingId` only |
| 7 | `notification` | no entity link | + `referenceId`, + `referenceType` |

#### Unchanged — keep as original ER

`device` · `article` · `comment` · `like` · `view`

---

#### ✅ `user` — add technician fields

```
// existing 19 fields stay +
userLocation         string
shopName             string
specialty            string
isOnline             bool
yearsExperience      int
completedJobsCount   int
services             [{ title, basePrice }]
workingHours         { days[], startTime, endTime }
certifications       [string]
portfolioImages      [string]
authProvider         enum     EMAIL | KAKAO | GOOGLE | APPLE   (PHONE removed — see DECISIONS AUTH-01)
kakaoId              string   optional, unique sparse — Kakao OAuth
termsAcceptedAt      date
verificationStatus   enum     NONE | PENDING | UNDER_REVIEW | APPROVED | REJECTED
badgeLevel           enum     NEW | VERIFIED | PREMIUM_PRO
verificationDocuments [string]
```

---

#### ✅ `booking` — add 3 fields

```
// existing 16 fields stay +
technicianId         ObjectId   FK → user
progressUpdates      [{ step, timestamp, note }]
aiClassification     { deviceType, issueCategory, repairComplexity, classifiedAt }
```

```
booking ──► user (customer)     userId
booking ──► user (technician)   technicianId   ← NEW
booking ──► device              deviceId
```

---

#### ✅ `review` — replace single rating

```
// remove: reviewRating
repairQuality        double   1–5
repairSpeed          double   1–5
communication        double   1–5
reviewContent        string
reviewImages         [string]
```

---

#### ✅ `payment` — add 2 fields

```
// existing fields stay +
paymentType          enum     DEPOSIT | FINAL
transactionId        string   KakaoPay ref
```

---

#### ✅ `message` — 1 change

```
bookingId            ObjectId   FK → booking   nullable ← was required
```

---

#### ✅ `following` — remove 1 field

```
followerId           ObjectId   FK → user
followingId          ObjectId   FK → user
createdAt            date
// REMOVE: userId
```

---

#### ✅ `notification` — add 2 fields

```
// existing fields stay +
referenceId          ObjectId
referenceType        enum     BOOKING | ARTICLE | MESSAGE | REVIEW
```

---

#### Corrected relationship diagram

```
user ──┬── device ── booking ──┬── payment
       │              │       ├── review
       │              │       └── message (bookingId nullable)
       │              │
       │         technicianId ──► user (technician)
       │
       ├── article ── like / view / comment
       ├── following (followerId ↔ followingId)
       └── notification (+ referenceId)
```

---

### 4.10 Final Decisions (Approved)

| # | Topic | Decision |
|---|-------|----------|
| 1 | ER model | **§4.9 corrected ER** is official |
| 2 | AI classification | **Embedded on `booking`** (see below) |
| 3 | Pre-booking chat | **Nullable `bookingId`** on message (see below) |
| 4 | Technician profile | **Embedded on `user`** document |
| 5 | Customer UI mockups | **Final** — pixel-perfect |
| 6 | Admin UI | **Not yet** — build during frontend phase |
| 7 | Auth UI mockups | **Final** — full auth flow (see §9.1) |

#### Decision 2 — AI classification → store on `booking`

```
aiClassification: {
  deviceType        enum     IPHONE | MACBOOK | IPAD | APPLE_WATCH
  issueCategory     string   e.g. screen, battery, water damage
  repairComplexity  enum     LOW | MEDIUM | HIGH
  classifiedAt      date
}
```

- Optional field — AI assists, never blocks booking
- Filled when user submits issue description
- No separate AI entity

#### Decision 3 — Pre-booking chat → nullable `bookingId`

```
BEFORE booking exists:
  message { senderId, receiverId, bookingId: null, content }

AFTER booking created:
  message { senderId, receiverId, bookingId: "<id>", content }
  → also update earlier messages: set bookingId on same thread
```

**How to find a chat thread:**
```
WHERE (senderId, receiverId) match AND bookingId is null OR = bookingId
```

No new `conversation` entity — keeps 12 entities, simplest for MVP.

#### Decision 4 — Technician data → embedded on `user`

```
user {
  ...base fields,
  // only when userType = TECHNICIAN:
  shopName, specialty, services[], workingHours, certifications[], ...
}
```

- One query for public profile — fast
- MongoDB fits embedded docs
- Separate collection only if needed later (post-MVP)

#### Auth & verification fields → add to `user`

```
authProvider          enum     EMAIL | KAKAO | GOOGLE | APPLE   (PHONE removed — see DECISIONS AUTH-01)
kakaoId               string   optional, unique sparse — Kakao OAuth
termsAcceptedAt       date     required on register
verificationStatus    enum     NONE | PENDING | UNDER_REVIEW | APPROVED | REJECTED
badgeLevel            enum     NEW | VERIFIED | PREMIUM_PRO
verificationDocuments [string] ID / passport uploads (technician only)
```

**MVP auth:** Phone + password, or Kakao login only.  
**Future:** Email, Apple, Google — not in MVP.

- **Customer:** `verificationStatus = NONE`, signup → dashboard immediately
- **Technician:** `verificationStatus = PENDING` → `UNDER_REVIEW` → `APPROVED` + `badgeLevel = VERIFIED`

---

## 5. Gap Analysis — Current vs Target

### 5.1 Backend Feature Matrix

| Feature | Required | Current | Gap |
|---------|----------|---------|-----|
| **Auth — Register** | ✅ | ✅ signup | — |
| **Auth — Login** | ✅ | ✅ login | — |
| **Auth — Logout** | ✅ | ❌ | Client-side or token blacklist |
| **Auth — JWT** | ✅ | ✅ | — |
| **Auth — Refresh Token** | ✅ | ❌ | Full implementation needed |
| **Auth — RBAC** | ✅ | ✅ USER/AGENT/ADMIN | AGENT → TECHNICIAN |
| **User — Profile management** | ✅ | ✅ updateMember | Technician fields to be added |
| **User — Device management** | ✅ | ❌ | Create DeviceModule |
| **User — Search technicians** | ✅ | ⚠️ getAgents | Filter by expertise, rating, device |
| **User — Technician profile** | ✅ | ⚠️ getMember | Public profile to be extended |
| **User — Create repair request** | ✅ | ❌ | BookingModule |
| **User — Chat** | ✅ | ⚠️ Global WS | Booking-based MessageModule + WS |
| **User — Track repair status** | ✅ | ❌ | Booking status flow |
| **User — Leave review** | ✅ | ❌ | ReviewModule |
| **User — Follow technicians** | ✅ | ✅ FollowModule | — |
| **User — Notifications** | ✅ | ❌ (schema exists) | NotificationModule |
| **Technician — Public profile** | ✅ | ⚠️ Partial | To be extended |
| **Technician — Manage services** | ✅ | ❌ | Add services[] to User schema |
| **Technician — Working hours** | ✅ | ❌ | Add workingHours to User schema |
| **Technician — Upload certifications** | ✅ | ❌ | certifications[] + upload |
| **Technician — Accept/reject requests** | ✅ | ❌ | Booking mutations |
| **Technician — Update repair progress** | ✅ | ❌ | Booking progressUpdates |
| **Technician — Publish articles** | ✅ | ✅ BoardArticle | Adapt as Article |
| **Technician — Analytics** | ✅ | ❌ | Analytics queries |
| **Admin — Verify technicians** | ✅ | ❌ | verificationStatus flow |
| **Admin — Manage reports** | ✅ | ❌ | ReportModule (optional MVP) |
| **Admin — Manage users** | ✅ | ⚠️ getAllMembersByAdmin | To be extended |
| **Admin — Content moderation** | ✅ | ❌ | Article/Review moderation |
| **AI — Issue classification** | ✅ | ❌ | External AI service integration |
| **AI — Technician matching** | ✅ | ❌ | Ranking algorithm |
| **Payment — KakaoPay** | ✅ | ❌ | PaymentModule + webhook |
| **Payment — 50% deposit** | ✅ | ❌ | DEPOSIT payment type |
| **Payment — 50% final** | ✅ | ❌ | FINAL payment type |

### 5.2 Frontend Feature Matrix

| Page | Required | Current | Gap |
|------|----------|---------|-----|
| Homepage | ✅ | ❌ | From scratch |
| Search Results | ✅ | ❌ | From scratch |
| Technician Profile | ✅ | ❌ | From scratch |
| Community | ✅ | ❌ | From scratch |
| Post Detail | ✅ | ❌ | From scratch |
| Messages | ✅ | ❌ | From scratch |
| Notifications | ✅ | ❌ | From scratch |
| My Page | ✅ | ❌ | From scratch |
| Auth Pages | ✅ | ❌ | From scratch |
| Technician Dashboard | ✅ | ❌ | From scratch |
| Incoming Requests | ✅ | ❌ | From scratch |
| Active Jobs | ✅ | ❌ | From scratch |
| Analytics | ✅ | ❌ | From scratch |
| Earnings | ✅ | ❌ | From scratch |
| Settings | ✅ | ❌ | From scratch |

**Frontend is entirely missing.** It will be added to the monorepo as `apps/fixora-web`.

---

## 6. Nestar → Fixora Transformation Map

### 6.1 Renaming

| Current | Target |
|---------|--------|
| `nestar` (package name) | `fixora` |
| `nestar-api` | `fixora-api` |
| `nestar-batch` | `fixora-batch` |
| `Member` | `User` |
| `MemberType.AGENT` | `UserRole.TECHNICIAN` |
| `BoardArticle` | `Article` |
| `Property` | ❌ Remove |

### 6.2 Reusable Components

The following modules can be adapted to Fixora with minimal changes:

1. **Auth infrastructure** — Guards, decorators, bcrypt, JWT service
2. **FollowModule** — Technician following works as-is
3. **LikeModule** — Article likes
4. **CommentModule** — Article comments
5. **ViewModule** — Article view counter
6. **GraphQL infrastructure** — Apollo Server, error formatting, upload
7. **DatabaseModule** — MongoDB connection
8. **Batch infrastructure** — Cron job structure (ranking algorithm will change)

### 6.3 Modules to Create from Scratch

| Module | Priority | Dependencies |
|--------|----------|--------------|
| `DeviceModule` | P0 | User |
| `BookingModule` | P0 | User, Device |
| `MessageModule` | P0 | Booking, WebSocket |
| `ReviewModule` | P1 | Booking |
| `PaymentModule` | P1 | Booking, KakaoPay SDK |
| `NotificationModule` | P1 | All modules |
| `AiModule` | P2 | Booking (classification) |
| `AdminModule` | P2 | User, Booking, Article |

---

## 7. Business Workflows

### 7.1 Booking Flow

```
1. User finds technician (Search)
2. User starts conversation (Message — pre-booking, phone hidden)
3. User creates booking (status: PENDING)
4. Technician reviews request
5. Technician accepts (ACCEPTED) or rejects (REJECTED)
   → After acceptance: phone number becomes visible
6. Repair begins (IN_PROGRESS)
7. Repair completed (COMPLETED)
8. User leaves review (Review)
```

### 7.2 Booking Status Transitions

```
PENDING ──→ ACCEPTED ──→ IN_PROGRESS ──→ COMPLETED
   │            │
   └──→ REJECTED
   └──→ CANCELLED (at any stage, per rules)
```

**Rule:** Only these 6 statuses may be used. No additional statuses should be defined.

### 7.3 Payment Flow

```
Booking ACCEPTED
    │
    ├── 50% Deposit (KakaoPay) ──→ status: COMPLETED
    │
Repair COMPLETED
    │
    └── 50% Final Payment (KakaoPay) ──→ status: COMPLETED
```

### 7.4 Chat Rules

| State | In-App Chat | Phone Visible |
|-------|-------------|---------------|
| Pre-booking | ✅ | ❌ |
| Booking ACCEPTED+ | ✅ | ✅ |
| Booking REJECTED/CANCELLED | ❌ (optional: read-only) | ❌ |

### 7.5 Review Rules

- Reviews allowed only for `COMPLETED` bookings
- One review per booking
- Categories: Repair Quality, Repair Speed, Communication (1–5)
- Optional: text + images

---

## 8. Technology Stack Comparison

### 8.1 Backend — Current vs Target

| Technology | Master Context | Current | Status |
|------------|----------------|---------|--------|
| Node.js | ✅ | ✅ | — |
| NestJS | ✅ | ✅ v10 | — |
| GraphQL | ✅ | ✅ Apollo Server v4 | — |
| WebSocket | ✅ | ✅ ws | Redesign needed |
| JWT | ✅ | ✅ @nestjs/jwt | Refresh token to be added |
| bcrypt | ✅ | ✅ bcryptjs | — |
| class-validator | ✅ | ✅ | — |
| Mongoose | ✅ | ✅ v8 | — |
| MongoDB | ✅ | ✅ | — |

### 8.2 Frontend — Target (Not Yet Built)

| Technology | Status |
|------------|--------|
| Next.js | To be created |
| React + TypeScript | To be created |
| Apollo Client | To be created |
| React Query | To be created |
| Material UI | To be created |
| Styled Components + Emotion | To be created |
| next-i18next | To be created (KO/EN) |
| SweetAlert2 | To be created |
| Toast UI Editor | To be created (article editor) |

### 8.3 Recommended Monorepo Structure (Target)

```
FixoraB/
├── apps/
│   ├── fixora-api/          # NestJS GraphQL API
│   ├── fixora-batch/        # Batch jobs
│   └── fixora-web/          # Next.js Frontend
├── libs/                    # Shared types, enums, utils
│   ├── shared-types/
│   └── shared-enums/
├── uploads/
├── docs/
└── package.json
```

---

## 9. Design System (Frontend)

Per Master Context, UI mockups are **final designs**. They must not be changed.

| Element | Value |
|---------|-------|
| Theme | Dark |
| Primary Color | Orange (#FF6B00 or mockup tone) |
| Background | Black |
| Accent | Orange Glow |
| Cards | Dark Glass Style |
| Border | Orange |
| Icons | Minimal |
| Layout | Modern SaaS, Professional Marketplace |

### 9.1 Auth Pages (Final Mockup)

> **Final wireframe.** Pixel-perfect. Split-screen desktop + single-column mobile. Dark theme, orange CTAs.

#### Auth flow

```
Login / Sign Up
      │
      ▼
Choose Role ──► Customer ──► Sign Up ──► Dashboard (My Page)
      │
      └──► Technician ──► Onboarding (6 steps) ──► ID Upload
                              │
                              ▼
                        Under Review ──► Admin approves ──► Tenant Dashboard
```

#### Screens

| # | Screen | Route | Key elements |
|---|--------|-------|--------------|
| 1 | **Login** | `/login` | Phone, Password, Forgot password?, orange Login, **Continue with Kakao**, → Sign up |
| 2 | **Sign Up (Customer)** | `/register` | Full Name, Phone, Password, Terms checkbox, orange Sign Up, **Sign up with Kakao**, → Log in |
| 3 | **Choose Role** | `/register/role` | 2 cards: **Customer** ("I want to book service") · **Technician** ("I want to offer services") |
| 4 | **Tech Onboarding Step 1** | `/register/technician/1` | Profile photo upload, Full Name, Phone — progress **Step 1 of 6** |
| 5 | **Tech ID Upload** | `/register/technician/id` | Upload ID Card / Passport — drag & drop area |
| 6 | **Under Review** | `/register/technician/pending` | Clock icon, "Under Review" message, **Go to Dashboard** (limited access until approved) |

#### Layout

| Viewport | Layout |
|----------|--------|
| **Desktop** | Split-screen — left: marketing ("Welcome to FIXORA", "Find trusted technicians") · right: form |
| **Mobile** | Single column — logo → form → CTA |

#### Technician badges

| Level | Icon | When |
|-------|------|------|
| New Technician | Grey shield | Just registered |
| Verified Technician | Blue shield ✓ | Admin approved |
| Premium Pro | Gold crown | Future / top performers |

**Verification flow:** Submit docs → Admin review → Approved → badge on public profile

#### Backend mutations

| Action | API | MVP |
|--------|-----|-----|
| Login | `login(userEmail, userPassword)` → JWT | ✅ |
| Customer signup | `signup(UserInput)` → JWT | ✅ |
| Technician signup | `signup(UserInput)` with `userType: TECHNICIAN` | ✅ |
| Upload ID | `uploadVerificationDoc(file)` | ✅ |
| Admin approve | `approveTechnician(userId)` | ✅ |
| Kakao / Google login | `loginWithOAuth({ authProvider, token })` | ✅ |
| Apple login | `loginWithOAuth(APPLE)` | UI Coming Soon (AUTH-02) |

#### Sign up fields by role

| Field | Customer | Technician |
|-------|----------|------------|
| Full Name | ✅ | ✅ Step 1 |
| Phone | ✅ | ✅ Step 1 |
| Password | ✅ | ✅ (onboarding) |
| Profile photo | — | ✅ Step 1 |
| Terms accepted | ✅ | ✅ |
| ID document | — | ✅ ID upload step |
| Email | — | — (future: optional profile field) |

### 9.2 Customer Pages (Final Mockups)

- Homepage (Navbar, Hero, Top Technicians, How It Works, Articles, Testimonials, Footer)
- Search Results
- Technician Profile
- Community
- Post Detail
- Messages
- Notifications
- My Page

### 9.3 Tenant Dashboard (Technician Side)

> **Terminology:** In Fixora, the **Tenant Dashboard** is the authenticated workspace for technicians (`userType: TECHNICIAN`). It is the technician-side counterpart to the customer **My Page**. UI mockups are final — implement pixel-perfect, no redesign.

#### 9.3.1 Overview

| Metric | Value |
|--------|-------|
| **Total screens** | 7 (+ shared sidebar on all) |
| **Layout** | Fixed left sidebar + main content area |
| **Theme** | Dark background, orange accents, dark glass cards |
| **Access** | TECHNICIAN role only (RBAC guard) |
| **Online toggle** | Sidebar — technician availability status |

#### 9.3.2 Shared Sidebar Navigation

Present on every tenant screen:

| # | Nav Item | Route (suggested) | Purpose |
|---|----------|-------------------|---------|
| 1 | Dashboard | `/technician` | Overview KPIs and summaries |
| 2 | Incoming Requests | `/technician/requests` | New repair requests |
| 3 | Active Jobs | `/technician/jobs` | In-progress repairs |
| 4 | Messages | `/technician/messages` | Customer chat |
| 5 | Notifications | `/technician/notifications` | System alerts |
| 6 | Public Profile | `/technician/profile` | Editable public-facing profile |
| 7 | Analytics | `/technician/analytics` | Performance metrics |
| 8 | Earnings | `/technician/earnings` | Revenue and withdrawals |
| 9 | Settings | `/technician/settings` | Account and preferences |
| 10 | Help & Support | `/technician/help` | Support links |

**Sidebar footer:** Online / Offline toggle — controls technician discoverability in search results.

#### 9.3.3 Screen 1 — Dashboard (Overview)

**Purpose:** At-a-glance summary of technician activity.

| Section | UI Elements | Data Source (ER) |
|---------|-------------|------------------|
| **KPI Cards (×4)** | Incoming Requests (12), Active Jobs (6), Earnings ($1,250), Rating (4.9) — each with % growth vs last month | `booking`, `payment`, `review`, `user.averageRating` |
| **Incoming Requests list** | Device, customer name, location, time, price | `booking` WHERE status = PENDING |
| **Active Jobs list** | Device, current status badge | `booking` WHERE status IN (ACCEPTED, IN_PROGRESS) |
| **Earnings Overview** | Line graph — monthly trend | `payment` aggregated by month |
| **Today's Schedule** | Vertical timeline of appointments | `booking.bookingDate` filtered by today |
| **Recent Reviews** | Latest customer feedback cards | `review` ORDER BY createdAt DESC LIMIT 5 |
| **Quick Actions** | Update Availability, Add Service, Withdraw Earnings, View Analytics | Links to Settings / Profile / Earnings / Analytics |

**GraphQL queries needed:**
- `getTechnicianDashboardStats(technicianId)` — KPI aggregates
- `getTechnicianIncomingRequests(technicianId, limit)` — preview list
- `getTechnicianActiveJobs(technicianId, limit)` — preview list
- `getTechnicianEarningsChart(technicianId, period)` — chart data
- `getTechnicianTodaySchedule(technicianId)` — today's bookings
- `getTechnicianRecentReviews(technicianId, limit)` — review feed

#### 9.3.4 Screen 2 — Incoming Requests

**Purpose:** Review and respond to new repair requests from customers.

| Section | UI Elements | Data Source (ER) |
|---------|-------------|------------------|
| **Filters** | Service, Device, Location, Sort by Newest | Query params on `booking` + `device` |
| **Request list (left pane)** | Cards with "New" badge — device, customer, location, time, price | `booking` WHERE status = PENDING |
| **Request detail (right pane)** | Device model, color, storage, problem description, preferred time, damage photos (×3) | `device`, `booking.problemDescription`, uploads |
| **Actions** | **Respond** (primary orange), **Decline** | Mutations: `acceptBooking`, `rejectBooking` |

**Status flow on action:**
- Respond → `bookingStatus: ACCEPTED`
- Decline → `bookingStatus: REJECTED`

**GraphQL:**
- `getIncomingRequests(technicianId, filters, sort)` — paginated list
- `getRequestDetail(bookingId)` — full detail with device + customer
- `acceptBooking(bookingId)` — mutation
- `rejectBooking(bookingId)` — mutation

> **ER gap:** Incoming requests require `technicianId` on `booking` or an assignment mechanism. Must be resolved before this screen can be built.

#### 9.3.5 Screen 3 — Active Jobs

**Purpose:** Track and update ongoing repairs.

| Section | UI Elements | Data Source (ER) |
|---------|-------------|------------------|
| **Status tabs** | All, In Progress, Waiting Parts, Completed, Cancelled | Filter on `booking.bookingStatus` |
| **Job detail (right pane)** | Device + repair title, current status | `booking` + `device` |
| **Repair Timeline** | Vertical stepper with timestamps: Request Accepted → Device Received → Repair in Progress → Quality Check → Job Completed | `booking` status history (may need `progressUpdates[]` — not in ER) |
| **Actions** | Update Status, Mark as Completed | Mutations: `updateBookingStatus`, `completeBooking` |

**Timeline steps vs booking status:**

| Timeline Step | Maps to `bookingStatus` |
|---------------|---------------------------|
| Request Accepted | ACCEPTED |
| Device Received | IN_PROGRESS (sub-step) |
| Repair in Progress | IN_PROGRESS |
| Quality Check | IN_PROGRESS (sub-step) |
| Job Completed | COMPLETED |

> **Note:** Sub-steps (Device Received, Quality Check) are UI timeline stages within `IN_PROGRESS`. Store as `progressUpdates[]` on booking or derive from timestamps — requires schema extension beyond current ER.

#### 9.3.6 Screen 4 — Messages

**Purpose:** Real-time chat with customers, with booking context sidebar.

| Section | UI Elements | Data Source (ER) |
|---------|-------------|------------------|
| **Chat list (left pane)** | Conversations — customer name, last message preview, job status tag | `message` grouped by `bookingId` |
| **Chat window (center)** | Message bubbles, timestamps, input field | `message` WHERE bookingId |
| **Request summary (right sidebar)** | Price, Status, Start Date, Location, Payment status | `booking`, `payment`, `device` |

**GraphQL + WebSocket:**
- `getTechnicianConversations(technicianId)` — chat list
- `getMessages(bookingId)` — message history
- `sendMessage(input)` — mutation + WS broadcast
- WS subscription: `messageReceived(bookingId)`

**Business rule:** Phone number visible only when `bookingStatus >= ACCEPTED`.

#### 9.3.7 Screen 5 — Notifications

**Purpose:** Chronological feed of system alerts.

| Section | UI Elements | Data Source (ER) |
|---------|-------------|------------------|
| **Grouped feed** | "Today" and "Earlier" sections | `notification` WHERE receiverId = technicianId |
| **Notification types** | New request, customer acceptance, status update, new message, new review, payment confirmed | `notification.notificationType` |

**GraphQL:**
- `getNotifications(userId, pagination)` — paginated feed
- `markNotificationRead(notificationId)` — mutation
- `markAllNotificationsRead(userId)` — mutation

#### 9.3.8 Screen 6 — Public Profile (Technician View)

**Purpose:** Preview and manage the public-facing profile that customers see.

| Section | UI Elements | Data Source (ER) |
|---------|-------------|------------------|
| **Header** | Photo, name, verified badge, title, rating, job count, location | `user` |
| **Trust badges** | Verified Technician, Secure Payments, Satisfaction Guarantee, 24/7 Support | Static UI badges (conditional on `user.isVerified`) |
| **Tabs** | About, Services, Portfolio, Reviews | Tab navigation |
| **Stats grid** | Years Experience, Jobs Completed, Rating, Satisfaction % | Aggregated from `user`, `booking`, `review` |
| **Services (right)** | Service list with "From $X" prices | Technician services (not in ER — extend `user` or separate collection) |
| **Reviews (right)** | Star distribution (5→1) + review list | `review` WHERE technicianId |

**GraphQL:**
- `getTechnicianPublicProfile(technicianId)` — full profile
- `updateTechnicianProfile(input)` — mutation
- `getTechnicianReviews(technicianId, pagination)` — reviews with distribution

#### 9.3.9 Screen 7 — Settings

**Purpose:** Account, preferences, availability, and security configuration.

| Tab | Fields | Data Source |
|-----|--------|-------------|
| **Profile Settings** | Name, Email, Phone, Location | `user` |
| **Account Settings** | Language, Currency, Time Zone, Theme (Dark) | User preferences (may need `userPreferences` sub-document) |
| **Notification Settings** | Email / In-App toggles per type | User preferences |
| **Security** | Change password, 2FA (future) | `user.userPassword` |
| **Payment Methods** | KakaoPay linked account, withdrawal settings | `payment` / external KakaoPay |
| **Availability** | Working hours toggle, day checklist (Mon–Sun), time range (09:00–18:00) | Technician working hours (not in ER — extend `user`) |

**GraphQL:**
- `getTechnicianSettings(technicianId)` — all settings
- `updateTechnicianSettings(input)` — mutation
- `updateWorkingHours(input)` — mutation

#### 9.3.10 Tenant Dashboard — Data Entity Map

Entities and attributes inferred from the Tenant Dashboard UI:

| Entity | Key Attributes Visible in UI | ER Collection |
|--------|------------------------------|---------------|
| **Technician** | name, photo, title, location, rating, jobs completed, experience, bio, online status, verified | `user` |
| **Customer** | name, location, photo | `user` |
| **Repair Request** | device, model, color, storage, problem, photos, preferred time, price, status | `booking` + `device` |
| **Job** | status, timeline steps, timestamps, final price | `booking` |
| **Service** | title, base price ("From $X") | Not in ER — extend `user` |
| **Message** | content, timestamp, sender, booking link | `message` |
| **Review** | rating, customer name, comment | `review` |
| **Notification** | type, timestamp, linked entity | `notification` |
| **Earnings** | daily/monthly totals, % growth, chart | `payment` (aggregated) |

#### 9.3.11 Tenant Dashboard — Backend API Summary

| Screen | Queries | Mutations | WebSocket |
|--------|---------|-----------|-----------|
| Dashboard | 6 | — | — |
| Incoming Requests | 2 | 2 (accept/reject) | — |
| Active Jobs | 2 | 2 (update status, complete) | — |
| Messages | 2 | 1 (send) | 1 (receive) |
| Notifications | 1 | 2 (read/mark all) | 1 (push) |
| Public Profile | 3 | 1 (update) | — |
| Settings | 1 | 2 (settings, hours) | — |
| **Total** | **17** | **10** | **2** |

#### 9.3.12 Tenant Dashboard — Implementation Notes

1. **Layout component:** Reusable `<TechnicianLayout>` with sidebar, online toggle, and active nav highlight.
2. **RBAC:** All routes under `/technician/*` require `userType === TECHNICIAN`.
3. **Online toggle:** Updates technician availability flag — affects search ranking visibility.
4. **KPI % growth:** Compare current month vs previous month aggregates in service layer.
5. **Repair timeline:** Sub-steps within `IN_PROGRESS` need a `progressUpdates[]` array on booking — **schema extension required**.
6. **Services & working hours:** Not in current ER — store as embedded arrays on `user` document for MVP.
7. **Earnings screen:** Referenced in sidebar and Quick Actions but shown as KPI on Dashboard; full Earnings page follows same `payment` aggregation pattern.
8. **Analytics screen:** Referenced in sidebar; implement with aggregated queries on bookings, reviews, earnings.

#### 9.3.13 Tenant vs Customer Side Comparison

| Aspect | Tenant Dashboard (Technician) | Customer Side (My Page) |
|--------|------------------------------|-------------------------|
| **Primary user** | TECHNICIAN | USER |
| **Layout** | Fixed sidebar (10 nav items) | Tab-based (Requests, Following, Stories, Settings) |
| **Core action** | Accept/reject requests, update job status | Create requests, track repairs, leave reviews |
| **KPI focus** | Earnings, active jobs, incoming requests | Request count, following count, stories |
| **Chat context** | Request summary sidebar (price, payment) | Same pattern — booking detail panel |
| **Profile** | Public profile editor + services | Personal profile + device management |
| **Unique features** | Online toggle, repair timeline, Quick Actions | Community posts, follow technicians |

### 9.4 Navbar Structure (Customer)

Logo | Home | Services | Bookings | Profile | Language Switch | Login | Find Technician

---

## 10. AI Features (MVP Limited)

AI assists but never makes decisions.

### 10.1 Issue Classification

**Input:** User issue description  
**Output:**
- `deviceType` — iPhone / MacBook / iPad / Apple Watch
- `issueCategory` — Screen, battery, water damage, etc.
- `repairComplexity` — Low / Medium / High

### 10.2 Technician Matching

**Criteria:**
- Expertise
- Device category
- Ratings
- Completed repairs count
- Historical performance

**Implementation:** Batch ranking algorithm + GraphQL query for recommendation list.

---

## 11. MVP Priority Matrix

### Phase 1 — Core Infrastructure (P0)

| # | Task | Estimated Effort |
|---|------|------------------|
| 1 | Project rename (nestar → fixora) | 1 day |
| 2 | Member → User conversion + TECHNICIAN role | 2 days |
| 3 | Remove Property module | 0.5 day |
| 4 | Create DeviceModule | 1 day |
| 5 | BookingModule + status flow | 3 days |
| 6 | Refresh Token implementation | 1 day |
| 7 | MessageModule + WebSocket redesign | 3 days |

### Phase 2 — Core Features (P1)

| # | Task | Estimated Effort |
|---|------|------------------|
| 8 | ReviewModule | 2 days |
| 9 | NotificationModule (In-App + Email) | 2 days |
| 10 | BoardArticle → Article conversion | 1 day |
| 11 | Technician profile extension (services, hours, certs) | 2 days |
| 12 | Technician search + filtering | 2 days |
| 13 | PaymentModule (KakaoPay integration) | 4 days |
| 14 | Admin — Technician verification | 1 day |

### Phase 3 — Frontend (P1)

| # | Task | Estimated Effort |
|---|------|------------------|
| 15 | Next.js monorepo setup | 1 day |
| 16 | Design system + theme | 2 days |
| 17 | Auth pages | 2 days |
| 18 | Homepage (pixel-perfect) | 3 days |
| 19 | Search + Technician Profile | 3 days |
| 20 | Booking flow UI | 3 days |
| 21 | Messages UI | 2 days |
| 22 | My Page + Notifications | 2 days |
| 23 | Technician Dashboard | 4 days |
| 24 | Community + Post Detail | 2 days |

### Phase 4 — AI & Analytics (P2)

| # | Task | Estimated Effort |
|---|------|------------------|
| 25 | AI issue classification | 2 days |
| 26 | AI technician matching | 2 days |
| 27 | Technician analytics | 2 days |
| 28 | Batch ranking update | 1 day |

**Total estimated duration:** ~45–50 working days (1 developer)

---

## 12. Risks and Considerations

### 12.1 Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Nestar domain remnants | Medium | Systematic rename + fully remove Property |
| WebSocket scalability | High | Redis adapter, room-based architecture |
| KakaoPay integration | Medium | Sandbox test environment, webhook validation |
| AI service cost | Low | Simple rule-based fallback in MVP |
| MongoDB schema migration | Medium | New collections, migrate old data |

### 12.2 Business Rules

| Rule | Detail |
|------|--------|
| ON_SITE service | Not implemented in MVP; show "Coming Soon" only |
| Review only on COMPLETED | Enforced via backend guard |
| Phone visibility | After booking ACCEPTED |
| Status list | Only 6 statuses; no others |
| Entities outside ER | Must not be created (Notice may be kept optionally) |

### 12.3 Coding Rules

- TypeScript everywhere; no `any`
- Business logic in services; thin resolvers
- NestJS + GraphQL + MongoDB best practices
- Pixel-perfect adherence to UI mockups
- No redesign of existing mockups

---

## 13. Batch Jobs — Transformation

Current batch jobs are real estate focused:

| Current | Fixora Equivalent |
|---------|-------------------|
| `batchTopProperties()` | ❌ Remove |
| `batchTopAgents()` | → `batchTopTechnicians()` — based on rating, completedRepairs, expertise |
| `batchRollback()` | → Technician ranking reset |

**New batch jobs:**
- Technician ranking calculation (daily)
- Auto-cancel expired PENDING bookings → CANCELLED
- Unread notification email delivery
- Analytics aggregation (weekly)

---

## 14. Conclusion and Recommendations

### 14.1 Overall Assessment

The FixoraB repository provides a solid starting point for NestJS + GraphQL + MongoDB infrastructure. However, the domain layer is entirely real estate focused and must be transformed into Fixora's Apple repair marketplace model.

**Reusability:** ~40% (auth, social modules, GraphQL infrastructure, batch skeleton)  
**Requires rewrite:** ~60% (domain models, booking, payment, message, review, frontend)

### 14.2 Recommended Starting Order

1. **Backend domain transformation** — User, Device, Booking modules
2. **Message + WebSocket** — Booking-based chat
3. **Frontend skeleton** — Next.js + design system
4. **Core UI pages** — Auth, Homepage, Search, Profile
5. **Booking + Payment flow** — End-to-end repair flow
6. **Review + Notification** — Post-completion features
7. **AI + Analytics** — Final phase

### 14.3 Priority When Uncertainty Exists

1. Business requirements (Master Context)
2. ER Diagram
3. UI mockups
4. Scalability principles
5. Do not invent undefined functionality — **FORBIDDEN**

---

## Appendix: Current File Inventory

### API Modules (apps/nestar-api/src/components/)

```
auth/          — JWT, guards, decorators
member/        — CRUD, login, signup, image upload
property/      — Real estate CRUD (TO BE REMOVED)
board-article/ — Article CRUD (WILL BECOME Article)
comment/       — Comment CRUD
follow/        — Follow system
like/          — Like system
view/          — View counter
```

### Schemas (apps/nestar-api/src/schemas/)

```
Member.model.ts        → User.model.ts
Property.model.ts      → TO BE REMOVED
BoardArticle.model.ts  → Article.model.ts
Comment.model.ts       → To be adapted
Follow.model.ts        → To be adapted
Like.model.ts          → To be adapted
View.model.ts          → To be adapted
Notification.model.ts  → To be updated
Notice.model.ts        → Outside ER, optional
```

### Missing Schemas (To Be Created)

```
Device.model.ts
Booking.model.ts
Message.model.ts
Review.model.ts
Payment.model.ts
```

---

## 15. Analysis Status — Complete

| Area | Status |
|------|--------|
| Codebase analysis | ✅ Done |
| ER model (12 entities) | ✅ Done — §4.9 final |
| ER fixes & decisions | ✅ Done — §4.10 |
| Gap analysis | ✅ Done |
| Tenant Dashboard UI | ✅ Done |
| Customer UI mockups | ✅ Confirmed final |
| Auth UI mockups | ✅ Done — §9.1 (full flow + technician verification) |
| Admin UI | ⏳ Build during frontend |
| MVP roadmap | ✅ Done |

**Analysis phase: COMPLETE. Ready to start implementation.**

---

*This document is based on the Fixora Master Context and current codebase analysis. It should be updated as development progresses.*
