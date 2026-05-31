# Fixora Frontend — AI Agent Instructions

> **Repo:** `FixoraF` (client-side only) · **Backend:** separate repo `FIXORAB` — do not implement backend here.

Works with **Cursor** and **Codex (VS Code)**. Both tools share the same handoff files — always continue from where the last agent stopped.

---

## Start Every Session

| Order | File | Purpose |
|-------|------|---------|
| 1 | [docs/AI_HANDOFF.md](docs/AI_HANDOFF.md) | **Read first** — current state, last agent, next task |
| 2 | [docs/TASK_BOARD.md](docs/TASK_BOARD.md) | Task status |
| 3 | [docs/DECISIONS.md](docs/DECISIONS.md) | Approved decisions — do not contradict |
| 4 | [docs/FIXORA-ANALIZ.md](docs/FIXORA-ANALIZ.md) | Full spec — UI mockups §9, ER model §4.9 |

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
| **This repo** | Next.js frontend (`nestar-next` base) → migrating to Fixora UI |
| **Backend** | `FIXORAB` — NestJS + GraphQL (separate, not this repo) |
| **Stack (here)** | Next.js, React, TypeScript, Apollo Client, MUI, SCSS, next-i18next |

Fixora is **not** a repair company — it connects customers with verified technicians.

---

## MVP Rules (UI / Client)

| Rule | Value |
|------|-------|
| Service type | `SHOP_VISIT` only — `ON_SITE` = "Coming Soon" badge only |
| Booking statuses | `PENDING`, `ACCEPTED`, `REJECTED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |
| Payment UI | 50% deposit + 50% final via **KakaoPay** |
| Auth UI | **Phone** + password, or **Kakao** login |
| UI mockups | **Final** — pixel-perfect per `FIXORA-ANALIZ.md` §9, no redesign |
| Theme | Dark background, orange primary, dark glass cards |
| AI | Display only — never auto-decide for the user |

---

## Frontend Coding Rules

- TypeScript everywhere — no `any`
- Match existing component, SCSS, and Apollo patterns in this repo
- Business rules enforced in UI guards; sensitive rules (phone visibility) also belong on backend
- GraphQL: use `apollo/user/` and `apollo/admin/` — update types when schema changes in FIXORAB
- Minimize scope — focused diffs only
- Do not commit unless explicitly asked

---

## When Uncertain

1. `DECISIONS.md` (UI + product rules)
2. UI mockups — `FIXORA-ANALIZ.md` §9
3. ER model — `FIXORA-ANALIZ.md` §4.9 (for GraphQL field names / types)
4. Existing components in `libs/` and `pages/`
5. **Do not invent** undefined UI or features

---

## Out of Scope (This Repo)

- NestJS modules, MongoDB schemas, resolvers, batch jobs → **FIXORAB**
- Creating new backend entities or API endpoints here

If a UI task needs a backend API that does not exist yet, note it in `AI_HANDOFF.md` as a blocker and use mock data or stub the integration.
