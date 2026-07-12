# FixoraF — Active Session Prompt

> **For Cursor / Codex.** Execute the task below. Then update `AI_HANDOFF.md` + `TASK_BOARD.md`.  
> **Last synced:** 2026-06-18 (aligned with FixoraB `schema.gql` + current frontend state)

---

## Session instructions

1. Read `AGENTS.md` → `docs/AI_HANDOFF.md` → `docs/TASK_BOARD.md`
2. Backend (FixoraB): `npm run start:dev` — GraphQL `http://localhost:2000/graphql`
3. Contract docs: `docs/FRONTEND_API.md`, `docs/AUTH_API.md`, `docs/schema.gql`

---

## Already Done (do not redo)

| ID | Area |
|----|------|
| P3-02 | Design system — dark/orange theme |
| P3-03 / P3-03b | Auth UI + OAuth (Google GIS + Kakao → `loginWithOAuth`; Google + Kakao on `/login` and `/register`; Apple Coming Soon) |
| P3-04 | Homepage + Hero AI (`heroRepairSearch`) |
| P3-05–P3-10 | Search, booking, messages, mypage, technician dashboard, community |
| P3-13 (partial) | Public Profile + Stories create + Dashboard interactions (see DECISIONS UI-07…UI-11) |

---

## Next task (pick one — see `AI_HANDOFF.md`)

### Option A — `PM-01` Mobile foundation (recommended)

**Goal:** Fixora mobile SCSS foundation before per-route polish.

1. Breakpoints: 992px / 768px / 639px (DECISIONS MOB-03)
2. Replace Nestar styles in `scss/mobile/main.scss` with Fixora dark/orange tokens (MOB-06)
3. Shared mixins from `scss/pc/`; safe-area CSS vars
4. Keep `#pc-wrap` / `#mobile-wrap` shell; prefer CSS breakpoints over `useDeviceDetect` for layout

**Skills:** `.cursor/skills/fixora-theme/SKILL.md`, `fixora-ui/SKILL.md`

---

### Option B — `P3-11` Rename Property → Device

**Goal:** UI copy and labels — not backend renames in this repo.

1. Search labels, booking flow, mypage tabs, legacy component strings
2. Routes: audit `pages/property` → device paths where still exposed
3. Do **not** delete legacy `libs/components/mypage/*` until `/member` and `/_admin` references checked (`AI_HANDOFF.md` blockers)

---

## Auth rules (frozen — `DECISIONS.md` AUTH-*)

| Wrong | Correct |
|-------|---------|
| Phone + password login | `userEmail` + password (AUTH-07) |
| `userPhoneNumber` as login | Contact only at signup |
| Apple OAuth API call from UI | Coming Soon toast only (AUTH-02) |
| `getBoardArticles` | `getArticles`, `authorData` |
| AI auto-picks technician | User clicks → `createBooking` (BIZ-07) |

**Env (`.env.local` — do not commit):**

```bash
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:2000/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:2000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<same as FixoraB>
NEXT_PUBLIC_KAKAO_JS_KEY=<Kakao JavaScript key>
```

---

## Acceptance criteria (any session)

1. Matches `docs/design/` mockups where applicable (UI-01)
2. GraphQL ops from `FRONTEND_API.md` / `schema.gql` only — no invented fields
3. `yarn typecheck` / `yarn lint` clean on touched files
4. Update `docs/AI_HANDOFF.md` + `docs/TASK_BOARD.md` before ending

---

## If blocked

- Backend not running → log in `AI_HANDOFF.md`; do not mock APIs indefinitely
- Missing operation → sync `schema.gql` from FixoraB; do not guess operation names
