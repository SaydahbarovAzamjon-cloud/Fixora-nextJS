# Fixora Frontend — AI Handoff

> **Read this first** (Cursor or Codex). **Update this before you finish.**

| Field | Value |
|-------|-------|
| **Last updated** | 2026-06-21 |
| **Last agent** | Cursor |
| **Last session** | GAP-098 localStorage workaround (Saved Technicians tab); removed legacy Chat widget from layouts; cleanup `nul`/dev scripts gitignore. **Backend gaps deferred per user.** |
| **Next agent should start with** | User-driven UI changes — **backend gaps deferred**; PM-01+ when user approves mobile |

---

## Current State (Frontend)

| Area | Status |
|------|--------|
| Analysis & UI specs | ✅ Complete — `FIXORA-ANALIZ.md` |
| Decisions | ✅ Locked — `DECISIONS.md` |
| Agent handoff (Cursor + Codex) | ✅ This file + `TASK_BOARD.md` |
| Design mockups | ✅ Uploaded — `docs/design/README.md` |
| Fixora UI migration | 🔄 In progress — burgundy customer theme shipped; auth UI done; technician portal stays orange |
| Backend API (FIXORAB / FixoraB) | ✅ MVP ready — `http://localhost:2000/graphql`; see `FRONTEND_API.md` |
| GraphQL contract sync | ✅ `FRONTEND_API.md`, `AUTH_API.md`, `schema.gql` in `docs/` |
| OAuth (Google/Kakao) UI | ✅ Wired — `SocialAuthRow` + `loginWithOAuth`; Apple Coming Soon only |
| Homepage Hero AI | ✅ `heroRepairSearch` in `HeroRepairSearch` component |
| Homepage sections (P3-04) | ✅ TopTechnicians, HowItWorks, TechTips, Testimonials — cards link to profile/article; View all → `/technicians` + `/community` |
| Technicians directory | ✅ `/technicians` — stats KPIs, top/new carousels, search/filter grid (`TechniciansPageStats`, GAP-097 workaround) |
| Messages UI (P3-07) | ✅ `/messages` — chat list + thread + request details, sender avatars, `scss/pc/messages/messages.scss` |
| My Page + Notifications (P3-08) | ✅ `/client/my-page` owner 6-tab dashboard + `/mypage` redirect + `/notifications` — mockup screenshots 2026-06-21 |
| Technician Dashboard (P3-13) | ✅ `/technician/dashboard` — quick actions functional (New Quote/Mark Available/View Schedule/Export Report); Weekly Earnings Week/Month/Year real with smart default; Today's Schedule **Add** (localStorage, device-only — no backend schedule model) merged with bookings (DECISIONS UI-11) |
| Public Client Profile | ✅ `/technician/client/[clientId]` — technician-viewed, read-only My Page reuse inside technician shell; repair history from technician-visible bookings, following via `getUserFollowings`, reviews via visible completed booking reviews; saved/full history needs GAP-063 |
| Public Profile live data (P3-13) | ✅ `/technician/profile` — header, About, My Articles, Services, Portfolio, Reviews, Followers, **Repair Stories (display + create)** all wired to live API; functional Message/View-Live/Follow buttons; empty states; stats → 0 when DB empty (DECISIONS UI-07…UI-10) |

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
| **Phase 3 Mobile** | **PM-01 → PM-12** — full mobile conversion after desktop pages (`TASK_BOARD.md`) |

Full checklist: `TASK_BOARD.md`

---

## Blockers

| Item | Notes |
|------|-------|
| KakaoPay sandbox | Production gateway only — **deposit UI wired** to mock `initiatePayment`/`confirmPayment` (P3-06b) |
| Tech onboarding steps 2–5 | Wireframe shows Step 1 + ID upload only |
| Apollo still on legacy nestar ops | P3-13 — migrate to `FRONTEND_API.md` names |
| Admin mockup | None — build incrementally (P3-15) |
| Light theme mockup | None — Phase 5 (P4-05+) |
| Mobile phase | **Phase 3 — PM-01…PM-12** — see `DECISIONS.md` MOB-* |
| Messages real-time | **Dedicated auth WS** (`connectFixoraWebSocket` in `fixoraWebSocket.ts`) + `FixoraWebSocketBridge` Apollo refetch. Polling stops when WS connected (`useRealtimePollInterval`). Booking/payment push still needs FIXORAB GAP-062. |
| "View Request" in Messages | Links to `/mypage/bookings/[id]` — booking detail page (P3-08b ✅) |
| Dashboard schedule persistence | **No backend schedule/appointment model** (only `User.workingHours`). Today's Schedule "Add" items live in **localStorage** (`fixora_tech_schedule_<userId>`) — device-only. Wire to a real model when the backend adds one (DECISIONS UI-11) |
| Story image upload | Multipart axios upload (`target: "story"`). **Viewer ✅** — ring tap opens `StoryViewerModal` on technician profile + homepage carousel (`getStoriesCarousel`). Owner preview mode hides reply/reactions. |
| Legacy `/mypage` components | `libs/components/mypage/*` (MyProperties, MyFavorites, MyArticles, WriteArticle, etc.) left in place but no longer imported by `/mypage` — still referenced by `/member` and `/_admin`; do not delete without checking |
| Notification delete | Backend has no `deleteNotification` / archive mutation. Technician notifications persist dismissed ids in localStorage per browser; cross-device delete needs GAP-061 backend work. |

---

## Key References

| Topic | Where |
|-------|-------|
| UI mockups | `docs/design/README.md` |
| Auth UI | `docs/design/auth/` + `FIXORA-ANALIZ.md` §9.1 |
| Customer pages | `docs/design/customer/` + `FIXORA-ANALIZ.md` §9.2 |
| Tenant Dashboard | `docs/design/technician/` + `FIXORA-ANALIZ.md` §9.3 |
| Theme / design | `DECISIONS.md` UI-* |
| GraphQL types | `docs/schema.gql`, `libs/types/`, `apollo/` |
| **Active task prompt** | **`docs/NEXT_SESSION.md`** |
| GraphQL contract | `docs/FRONTEND_API.md`, `docs/AUTH_API.md` |

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
