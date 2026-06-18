# Fixora Frontend — AI Agent Instructions

> **Repo:** `FixoraF` (client-side only) · **Backend:** separate repo `FIXORAB` / `FixoraB` — do not implement backend here.

Works with **Cursor** and **Codex (VS Code)**. Both tools share the same handoff files — always continue from where the last agent stopped.

---

## Start Every Session

| Order | File | Purpose |
|-------|------|---------|
| 1 | [docs/AI_HANDOFF.md](docs/AI_HANDOFF.md) | **Read first** — current state, last agent, next task |
| 2 | [docs/NEXT_SESSION.md](docs/NEXT_SESSION.md) | **Active task prompt** — execute this session's work |
| 3 | [docs/TASK_BOARD.md](docs/TASK_BOARD.md) | Task status |
| 4 | [docs/DECISIONS.md](docs/DECISIONS.md) | Approved decisions — do not contradict |
| 5 | [docs/FIXORA-ANALIZ.md](docs/FIXORA-ANALIZ.md) | Full spec — UI mockups §9, ER model §4.9 |
| 6 | [docs/FRONTEND_API.md](docs/FRONTEND_API.md) | GraphQL contract — sync copy from FIXORAB |
| 7 | [docs/schema.gql](docs/schema.gql) | Generated schema — operation & type names |
| 8 | [docs/BACKEND_GAPS.md](docs/BACKEND_GAPS.md) | **UI bor / backend yo‘q** — mock & workaround registry; yangi gap qo‘shish shu yerda |
| 9 | [docs/AUTH_API.md](docs/AUTH_API.md) | Auth flows — OAuth, signup, refresh |
| 10 | [docs/design/README.md](docs/design/README.md) | UI mockups — pixel-perfect reference |
| 11 | [.cursor/skills/fixora-ui/SKILL.md](.cursor/skills/fixora-ui/SKILL.md) | UI implementation — overview |
| 12 | [.cursor/skills/fixora-theme/SKILL.md](.cursor/skills/fixora-theme/SKILL.md) | Colors, MUI theme, SCSS tokens (P3-02) |
| 13 | [.cursor/skills/fixora-ui-kit/SKILL.md](.cursor/skills/fixora-ui-kit/SKILL.md) | Button, Input, GlassCard (P3-02b) |
| 14 | [.cursor/skills/fixora-navbar/SKILL.md](.cursor/skills/fixora-navbar/SKILL.md) | Navbar / Top.tsx (P3-04) |

Keep FixoraF `docs/DECISIONS.md`, `docs/FRONTEND_API.md`, `docs/schema.gql`, and `docs/AUTH_API.md` **in sync** with FIXORAB when the backend contract changes.

---

## Cursor + Codex Handoff Protocol

Both agents work on **this same frontend repo**. To avoid duplicate work or lost progress:

1. **Before starting** — read `docs/AI_HANDOFF.md` (check `Last agent` and `Next task`).
2. **While working** — update `docs/TASK_BOARD.md` when a task moves to In Progress or Done.
3. **Before ending** — update `docs/AI_HANDOFF.md`:
   - Set `Last agent:` to `Cursor` or `Codex`
   - Set `Last session:` to what you did
   - Set `Next agent should start with:` to the exact next task ID
   - List files changed and any blockers

**Never restart** work that is already marked Done. **Never skip** the handoff update.

---

## Project Identity

Fixora is an AI-powered **Apple device repair marketplace** for South Korea.

| | |
|---|---|
| **This repo** | Next.js frontend (`fixora-next`) — Fixora UI |
| **Backend** | `FIXORAB` — NestJS + GraphQL |
| **GraphQL URL** | `NEXT_PUBLIC_GRAPHQL_URL` (default `http://localhost:2000/graphql`) |
| **Stack (here)** | Next.js, React, TypeScript, Apollo Client, MUI, SCSS, **next-i18next** (KO + EN) |
| **Real-time** | WebSocket `ws://host:port?token=<accessToken>` |

Fixora is **not** a repair company — it connects customers with verified technicians.

---

## Repo structure (Fixora — keep legacy folder patterns)




Reuse existing `libs/`, `pages/`, and `apollo/` patterns before creating new folders.

---

## MVP Rules (UI / Client) — must match FIXORAB

| Rule | Value |
|------|-------|
| Service type | `SHOP_VISIT` only — `ON_SITE` = "Coming Soon" badge only (BIZ-01) |
| Booking statuses | `PENDING`, `ACCEPTED`, `REJECTED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |
| Payment UI | 50% deposit + 50% final — show **KakaoPay** branding |
| Payment backend | **Mock gateway** (PAY-05) — `initiatePayment` → `confirmPayment`; portfolio OK |
| Auth login | **Email** + password (`userEmail`) — **not phone** (AUTH-07) |
| Auth OAuth | **Kakao**, **Google**, **Apple** (Apple = "Coming Soon" if not configured) |
| Signup phone | `userPhoneNumber` = **contact only** at signup — never login field |
| Phone in chat | Hide until booking **ACCEPTED** (BIZ-04) |
| UI mockups | **Final** — pixel-perfect per `docs/design/` + `FIXORA-ANALIZ.md` §9, no redesign |
| Theme | Dark background, orange primary, dark glass cards (UI-06) |
| i18n | **Korean + English** — `next-i18next`; backend errors stay English |
| AI | **Display only** — never auto-select technician or auto-submit booking (BIZ-07) |

---

## Key enums (GraphQL — use exact names)

| Enum | MVP values |
|------|------------|
| `UserType` | `USER`, `TECHNICIAN`, `ADMIN` |
| `AuthProvider` | `EMAIL`, `KAKAO`, `GOOGLE`, `APPLE` — no `PHONE` |
| `BookingStatus` | `PENDING`, `ACCEPTED`, `REJECTED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |
| `BookingType` | `SHOP_VISIT` only |
| `DeviceCategory` | `IPHONE`, `MACBOOK`, `IPAD`, `APPLE_WATCH` |
| `PaymentType` | `DEPOSIT`, `FINAL` |
| `PaymentMethod` | `KAKAOPAY`, `CARD`, `CASH` |
| `ArticleStatus` | `DRAFT`, `PUBLISHED` |
| `VerificationStatus` | `NONE`, `PENDING`, `UNDER_REVIEW`, `APPROVED`, `REJECTED` |

---

## GraphQL integration (FIXORAB contract)

**Authority:** `docs/FRONTEND_API.md` + `schema.gql`. **Do not guess** operation names.

### Auth
- Login: `login({ userEmail, userPassword })`
- Signup: `signup(UserInput)`
- OAuth: `loginWithOAuth` → `completeOAuthSignup`
- Reset: `requestPasswordReset` / `resetPassword`
- Session: `accessToken` + `refreshToken` + `refreshToken` mutation
- **Never:** phone/SMS login

### Homepage Hero (AI)
- `heroRepairSearch({ problemText, limit })` — public
- User **clicks** technician → profile → `createBooking` (user-selected `technicianId`)

### Discovery
- `getTechnicians`, `getUser`

### Booking & payment
- `createDevice` → `createBooking` (`SHOP_VISIT`)
- `initiatePayment` → `confirmPayment` (mock)
- Technician: `getIncomingRequests`, `acceptBooking`, `getTechnicianBookings`

### Community
- `getArticles`, `getArticle`, `authorData` — not `BoardArticle`
- `getComments` — use `authorData` not `memberData`
- `getUserFollowings` — not `getMemberFollowings` (legacy still works)

### Messages
- `getMyConversations`, `getMessages`, `sendMessage`
- WS: `messageReceived`, `notificationReceived`

### Apollo
- Operations in `apollo/user/`, `apollo/admin/`
- Bearer token on guarded calls

---

## Route map (§9)

| Route | Task |
|-------|------|
| `/` | Homepage + Hero AI (P3-04) |
| `/login`, `/register` | Auth (P3-03) |
| `/search`, `/technicians/[id]` | Search (P3-05) |
| `/community` | Articles (P3-10) |
| `/my-page`, `/messages` | Customer (P3-08, P3-07) |
| `/technician/*` | Tenant dashboard (P3-09) |

---

## i18n (KO + EN)

- `next-i18next` — `public/locales/ko/`, `public/locales/en/`
- No hardcoded UI strings
- Backend errors: English OK

---

## Environment (.env.local)

```bash
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:2000/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:2000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_KAKAO_JS_KEY=
```

---

## Reuse Policy

Before creating new code, search existing:

- Components
- Hooks
- Types
- GraphQL operations
- Utilities
- Services
- Apollo modules

Reuse first.
Create second.

Never create duplicate functionality.

## Design Rule

**Primary mockup path:** `docs/design/` — see [docs/design/README.md](docs/design/README.md) for file → route → task mapping.

When implementing UI:

- Follow the design exactly — pixel-perfect
- Do not redesign, simplify, or add extra sections
- Preserve spacing, hierarchy and layout
- Use existing project architecture (`libs/`, `pages/`, `apollo/`)

**Mockup priority:** High-fidelity PNG > wireframe when they conflict (e.g. login field is **email** per AUTH-07, not phone).

**Admin UI:** No mockup — build incrementally (P3-15), light utilitarian dashboard with Fixora orange accent. See `docs/design/admin/README.md`.

**Mobile:** Phase 2 = desktop-first + responsive-safe; **Phase 3 (PM-01…PM-12)** = full mobile conversion — see `docs/TASK_BOARD.md` and `DECISIONS.md` MOB-*.

**Light theme:** No mockup yet — Phase 5 (P4-05+). MVP ships **dark only**; build theme tokens with light placeholders in P3-02.

## Migration Rule

Keep:

- Existing architecture
- Apollo patterns
- Folder structure
- Authentication patterns

Do not copy legacy branding from the old real-estate template:

- Old template branding (replaced by Fixora)
- Legacy real-estate UI
- Legacy real-estate styling
- Real-estate business logic not required by Fixora

## Package Manager

- Use Yarn for all frontend commands.
- Do not use npm or pnpm.
- Install dependencies with:

```bash
yarn
```

- Start development server with:

```bash
yarn dev
```

- Run type checking with:

```bash
yarn typecheck
```

- Run linting with:

```bash
yarn lint
```

- Build production bundle with:

```bash
yarn build
```