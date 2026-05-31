# Fixora Frontend — AI Handoff

> **Read this first** (Cursor or Codex). **Update this before you finish.**

| Field | Value |
|-------|-------|
| **Last updated** | 2026-05-31 |
| **Last agent** | Cursor |
| **Last session** | Set up frontend-focused docs + Cursor/Codex shared handoff |
| **Next agent should start with** | `P3-02` — Design system + dark/orange Fixora theme |

---

## Current State (Frontend)

| Area | Status |
|------|--------|
| Analysis & UI specs | ✅ Complete — `FIXORA-ANALIZ.md` |
| Decisions | ✅ Locked — `DECISIONS.md` |
| Agent handoff (Cursor + Codex) | ✅ This file + `TASK_BOARD.md` |
| Fixora UI migration | ⬜ Not started — still nestar real-estate UI |
| Backend API (FIXORAB) | ⚠️ Separate repo — still nestar domain |

---

## Repo Layout (Client-Side)

```
FixoraF/
├── pages/           # Routes (index, property→device, agent→technician, etc.)
├── libs/
│   ├── components/  # UI components by feature
│   ├── types/       # TypeScript interfaces
│   ├── enums/       # Domain enums
│   └── auth/        # JWT / session helpers
├── apollo/          # GraphQL queries & mutations
├── scss/            # Global + page styles
└── docs/            # Source of truth for all agents
```

**Reusable (~40%):** Layouts, Apollo client, auth skeleton, community/articles, i18n, admin shell  
**Rewrite (~60%):** Pages, components, theme, terminology (Property→Device, Agent→Technician)

---

## Next Steps (Frontend Priority)

| ID | Task |
|----|------|
| P3-02 | Design system — dark/orange theme, MUI + SCSS tokens |
| P3-03 | Auth UI (§9.1) — Phone + Kakao, role select, tech onboarding |
| P3-04 | Homepage — pixel-perfect |
| P3-05 | Search + Technician Profile |
| P3-06 | Booking flow UI |
| P3-07 | Messages UI |
| P3-08 | My Page + Notifications |
| P3-09 | Tenant Dashboard — 7 screens (§9.3) |
| P3-10 | Community + Post Detail |

Full checklist: `TASK_BOARD.md`

---

## Blockers

| Item | Notes |
|------|-------|
| KakaoPay sandbox | Needed before payment UI (P3-06) |
| Tech onboarding steps 2–5 | Wireframe shows Step 1 + ID upload only |
| New GraphQL operations | Some Fixora APIs may not exist in FIXORAB yet — stub or mock |

---

## Key References

| Topic | Where |
|-------|-------|
| Auth UI | `FIXORA-ANALIZ.md` §9.1 |
| Customer pages | `FIXORA-ANALIZ.md` §9.2 |
| Tenant Dashboard | `FIXORA-ANALIZ.md` §9.3 |
| Theme / design | `FIXORA-ANALIZ.md` §9 + `DECISIONS.md` UI-* |
| GraphQL types | `libs/types/`, `apollo/` |

---

## Session Update Template

Copy this when finishing a session (Cursor **or** Codex):

```markdown
| **Last updated** | YYYY-MM-DD |
| **Last agent** | Cursor | Codex |
| **Last session** | [what you did — be specific] |
| **Next agent should start with** | [task ID + one-line description] |

### Completed this session
- P3-XX — description

### Files changed
- path/to/file.tsx

### Notes for next agent
- ...
```

Also update matching rows in `TASK_BOARD.md`.
