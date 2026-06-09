# Admin UI Mockups

> **Status: TBD** — No design mockup provided yet.

## Approach (P3-15)

Build incrementally during frontend phase. Per `DECISIONS.md` UI-05:

- **Theme:** Light utilitarian dashboard (not dark glass) — easier to read tables and data
- **Brand:** Fixora orange accent on primary actions and active nav
- **Base:** Adapt existing `pages/_admin/*` + `LayoutAdmin.tsx` shell

## MVP Screens

| ID | Screen | Route | Priority |
|----|--------|-------|----------|
| P3-15a | Admin shell + menu | `/_admin` | After P3-09 |
| P3-15b | Technician verification queue | `/_admin/technicians/pending` | Required for tech onboarding flow |
| P3-15c | Users + Bookings lists | `/_admin/users`, `/_admin/bookings` | When FIXORAB APIs ready |
| P3-15d | Community moderation | `/_admin/community` | After P3-10 |

## Verification Flow Dependency

```
Tech submits ID → Admin reviews (P3-15b) → Approve → Verified badge on profile
```

Add mockup PNGs here when available: `docs/design/admin/`
