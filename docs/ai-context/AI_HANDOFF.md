# AI Handoff (Codex / Cursor)

> **Canonical handoff:** [`../AI_HANDOFF.md`](../AI_HANDOFF.md) — **always read and update that file first.**

This folder (`docs/ai-context/`) is extra working context for **Codex in VS Code** and **Cursor**. Both tools share one project state via `../AI_HANDOFF.md` and `../TASK_BOARD.md`.

---

## Quick Start (Any Agent)

1. Open `../AI_HANDOFF.md` → note `Last agent` and `Next agent should start with`
2. Open `../TASK_BOARD.md` → confirm task status
3. Do the work (frontend/client-side only in this repo)
4. Update `../AI_HANDOFF.md` + `../TASK_BOARD.md` before ending
5. Set `Last agent:` to `Cursor` or `Codex`

---

## Last Agent

Cursor — 2026-06-09 (OAuth Google/Kakao + Hero AI complete)

## Extended Notes

- **OAuth:** Google GIS `initCodeClient` + Kakao SDK → `loginWithOAuth`; OAuth onboarding via `/register/role?oauth=1` + `completeOAuthSignup`.
- **Auth API:** `apollo/user/auth.ts` — Fixora `login`, `signup`, OAuth mutations; email login uses `userEmail`.
- **Hero:** `HeroRepairSearch` → `heroRepairSearch` query; user clicks technician (BIZ-07).
- **Env required:** `NEXT_PUBLIC_GRAPHQL_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_KAKAO_JS_KEY` in `.env.local`.
- **Next task:** P3-04 homepage sections beyond hero.

See `../AI_HANDOFF.md` for full state, blockers, and session template.
