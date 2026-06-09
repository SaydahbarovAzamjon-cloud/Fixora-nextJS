# Fixora UI Mockups

> **Source of truth for pixel-perfect implementation.**  
> Mockups are **final** — do not redesign, simplify, or add extra sections.

**Last updated:** 2026-06-09

---

## Rules

1. Follow mockups exactly — spacing, hierarchy, layout preserved.
2. **High-fidelity > wireframe** when they conflict (e.g. login uses **email**, not phone — see `AGENTS.md` AUTH-07).
3. Text spec fallback: `docs/FIXORA-ANALIZ.md` §9.
4. **Admin:** no mockup — build incrementally (P3-15), light utilitarian UI.
5. **Light theme:** no mockup yet — Phase 4 (P4-05+). MVP ships **dark only**.

---

## File Index

| File | Task | Route(s) | Description |
|------|------|----------|-------------|
| `auth/auth-login-signup-hifi.png` | P3-03 | `/login`, `/register` | Login + Sign Up (high-fidelity) |
| `auth/auth-flow-wireframe.png` | P3-03 | `/register/role`, `/register/technician/*` | Full auth flow, role select, tech onboarding, mobile, badges |
| `customer/homepage.png` | P3-04 | `/` | Homepage — hero, top technicians, how it works, articles, testimonials |
| `customer/customer-pages-full.png` | P3-05–P3-10, P3-08 | see below | Customer pages composite (8 sections) |
| `technician/technician-dashboard-full.png` | P3-09 | `/technician/*` | Technician dashboard — 7 screens composite |

---

## Auth Flow (P3-03)

```
Login / Sign Up
      │
      ▼
Choose Role ──► Customer ──► Sign Up ──► My Page
      │
      └──► Technician ──► Onboarding (6 steps) ──► ID Upload
                              │
                              ▼
                        Under Review ──► Admin approves ──► Tenant Dashboard
```

| Screen | Route | Mockup reference |
|--------|-------|------------------|
| Login | `/login` | `auth-login-signup-hifi.png` (left), wireframe §3.1 |
| Sign Up (Customer) | `/register` | `auth-login-signup-hifi.png` (right), wireframe §3.2 |
| Choose Role | `/register/role` | wireframe §3.3 |
| Tech Onboarding Step 1 | `/register/technician/1` | wireframe §4.4 |
| Tech ID Upload | `/register/technician/id` | wireframe §4.5 |
| Under Review | `/register/technician/pending` | wireframe §4.6 |

### Technician badges (wireframe §2, §5)

| Level | When |
|-------|------|
| New Technician | Just registered |
| Verified Technician | Admin approved |
| Premium Pro | Future / top performers |

---

## Customer Pages (`customer-pages-full.png`)

| # | Section | Task | Route |
|---|---------|------|-------|
| 1 | Navbar states (guest + authenticated) | P3-04 | all customer pages |
| 2 | Search Results | P3-05 | `/search` |
| 3 | Technician Profile | P3-05 | `/technicians/[id]` |
| 4 | Community | P3-10 | `/community` |
| 5 | Post Detail | P3-10 | `/community/[id]` |
| 6 | Messages | P3-07 | `/messages` |
| 7 | Notifications | P3-08 | `/notifications` |
| 8 | My Page | P3-08 | `/my-page` |

Homepage detail: `customer/homepage.png` (P3-04).

---

## Technician Dashboard (`technician-dashboard-full.png`)

| # | Screen | Route |
|---|--------|-------|
| 1 | Dashboard | `/technician` |
| 2 | Incoming Requests | `/technician/requests` |
| 3 | Active Jobs | `/technician/jobs` |
| 4 | Messages | `/technician/messages` |
| 5 | Notifications | `/technician/notifications` |
| 6 | Public Profile | `/technician/profile` |
| 7 | Settings | `/technician/settings` |

Shared: fixed left sidebar, online toggle, dark theme + orange accents.

---

## Design Tokens (from mockups — for P3-02)

| Token | Value |
|-------|-------|
| Primary orange | `#FF6B00` (approx — verify from hifi export) |
| Background | `#0D0D0D` |
| Card / glass | `#1A1A1A` with orange border glow |
| Text primary | `#FFFFFF` |
| Text secondary | light gray |

Build tokens in `scss/variables.scss` + MUI theme with **light placeholder variables** for Phase 4.

---

## Known Gaps

| Item | Status |
|------|--------|
| Admin panel mockup | TBD — see `admin/README.md` |
| Light theme mockup | TBD — Phase 4 (P4-05+) |
| Separate mobile PNG exports | Mobile layouts in `auth-flow-wireframe.png` only |
| Booking / payment screens | Not in current assets — follow `FIXORA-ANALIZ.md` §9.2 |

---

## For Agents

Read this file **before** implementing any UI task. Cross-reference task ID in `docs/TASK_BOARD.md`.
