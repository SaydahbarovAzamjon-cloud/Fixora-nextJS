---
name: fixora-ui
description: >-
  Implements Fixora frontend UI pixel-perfect from docs/design mockups using
  Next.js, MUI, and SCSS. Use when building or styling pages, components, theme
  tokens, auth, homepage, technician dashboard, or any Fixora UI task (P3-02+).
---

# Fixora UI Implementation

## Before coding

1. Read `docs/design/README.md` — file → route → task mapping
2. Open the PNG for the current task under `docs/design/`
3. Read `AGENTS.md` MVP rules — do not contradict `docs/DECISIONS.md`
4. Search existing `libs/components/`, `pages/`, `apollo/` — reuse first

## Design rules

- Mockups are **final** — no redesign, simplify, or extra sections
- **High-fidelity PNG > wireframe** when they conflict
- Login field: **email** (`userEmail`) — not phone (AGENTS.md)
- Theme: dark bg, orange primary `#FF6B00`, dark glass cards
- MVP: dark only — use CSS variables with light placeholders for Phase 4
- i18n: **KO + EN mandatory** — every UI string in `public/locales/en/` + `public/locales/kr/`; use `technician` namespace for technician portal; see AGENTS.md i18n section
- Package manager: **yarn** only

## Mockup paths

| Task | Mockup |
|------|--------|
| P3-02 / P3-03 | `docs/design/auth/auth-login-signup-hifi.png` |
| P3-03 flow | `docs/design/auth/auth-flow-wireframe.png` |
| P3-04 | `docs/design/customer/homepage.png` |
| P3-05–P3-10, P3-08 | `docs/design/customer/customer-pages-full.png` |
| P3-09 | `docs/design/technician/technician-dashboard-full.png` |

## Implementation stack

- **Theme:** `.cursor/skills/fixora-theme/SKILL.md` → `scss/variables.scss` + `scss/MaterialTheme/`
- **UI kit:** `.cursor/skills/fixora-ui-kit/SKILL.md` → `libs/components/ui/`
- **Navbar:** `.cursor/skills/fixora-navbar/SKILL.md` → `libs/components/Top.tsx`
- **Components:** prefer `libs/components/ui/` for shared Button, Input, GlassCard

## Do not

- Copy legacy real-estate branding, light theme defaults, or property/agent terminology in new UI
- Auto-select technician or auto-submit booking (BIZ-07)
- Guess GraphQL operation names — use `docs/FRONTEND_API.md`

## After task

Update `docs/TASK_BOARD.md` and `docs/AI_HANDOFF.md`.
