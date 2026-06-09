# Fixora Frontend — AI Handoff

> **Read this first** (Cursor or Codex). **Update this before you finish.**

| Field | Value |
|-------|-------|
| **Last updated** | 2026-06-09 |
| **Last agent** | Cursor |
| **Last session** | Design mockups indexed in `docs/design/` — renamed files, README index, updated AGENTS.md + TASK_BOARD.md |
| **Next agent should start with** | `P3-02` — Design system + dark/orange Fixora theme |

---

## Current State (Frontend)

| Area | Status |
|------|--------|
| Analysis & UI specs | ✅ Complete — `FIXORA-ANALIZ.md` |
| Decisions | ✅ Locked — `DECISIONS.md` |
| Agent handoff (Cursor + Codex) | ✅ This file + `TASK_BOARD.md` |
| Design mockups | ✅ Uploaded — `docs/design/README.md` |
| Fixora UI migration | ⬜ Not started — still nestar real-estate UI |
| Backend API (FIXORAB) | ⚠️ Separate repo — still nestar domain |

---

## Design Assets

| Folder | Files |
|--------|-------|
| `docs/design/auth/` | `auth-login-signup-hifi.png`, `auth-flow-wireframe.png` |
| `docs/design/customer/` | `homepage.png`, `customer-pages-full.png` |
| `docs/design/technician/` | `technician-dashboard-full.png` |
| `docs/design/admin/` | TBD — see `admin/README.md` |

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
├── docs/
│   └── design/      # UI mockups — pixel-perfect reference
└── docs/            # Source of truth for all agents
```

**Reusable (~40%):** Layouts, Apollo client, auth skeleton, community/articles, i18n, admin shell  
**Rewrite (~60%):** Pages, components, theme, terminology (Property→Device, Agent→Technician)

---

## Next Steps (Frontend Priority)

| ID | Task |
|----|------|
| P3-02 | Design system — dark/orange theme, MUI + SCSS tokens, light placeholders |
| P3-03 | Auth UI — mockups in `docs/design/auth/` |
| P3-04 | Homepage — `docs/design/customer/homepage.png` |
| P3-05 | Search + Technician Profile |
| P3-06 | Booking flow UI |
| P3-07 | Messages UI |
| P3-08 | My Page + Notifications |
| P3-09 | Tenant Dashboard — `docs/design/technician/technician-dashboard-full.png` |
| P3-10 | Community + Post Detail |

Full checklist: `TASK_BOARD.md`

---

## Blockers

| Item | Notes |
|------|-------|
| KakaoPay sandbox | Needed before payment UI (P3-06) |
| Tech onboarding steps 2–5 | Wireframe shows Step 1 + ID upload only |
| New GraphQL operations | Some Fixora APIs may not exist in FIXORAB yet — stub or mock |
| Admin mockup | None — build incrementally (P3-15) |
| Light theme mockup | None — Phase 4 (P4-05+) |

---

## Key References

| Topic | Where |
|-------|-------|
| UI mockups | `docs/design/README.md` |
| Auth UI | `docs/design/auth/` + `FIXORA-ANALIZ.md` §9.1 |
| Customer pages | `docs/design/customer/` + `FIXORA-ANALIZ.md` §9.2 |
| Tenant Dashboard | `docs/design/technician/` + `FIXORA-ANALIZ.md` §9.3 |
| Theme / design | `DECISIONS.md` UI-* |
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
