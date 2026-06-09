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

Cursor — 2026-06-09 (P3-02 dark/orange theme + UI kit complete)

## Extended Notes

- **Scope:** UI, pages, components, Apollo client, SCSS — not NestJS/backend.
- **Backend:** FIXORAB repo — stub GraphQL if API not ready yet.
- **Current UI:** legacy real-estate template — migrate terminology and layouts to Fixora.
- **Design mockups:** `docs/design/README.md` — auth, customer, technician PNGs ready.
- **Theme:** `fixoraDark` MUI theme active in `_app.tsx`; tokens in `scss/variables.scss`.
- **UI kit:** `libs/components/ui/` — FixoraButton, FixoraInput, FixoraGlassCard, FixoraKakaoButton.
- **Next task:** P3-03 Auth UI per `docs/design/auth/` mockups.

See `../AI_HANDOFF.md` for full state, blockers, and session template.
