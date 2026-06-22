# Admin UI Mockups

> **Status:** Reference screenshots provided 2026-06-22 — implemented in Fixora burgundy theme (not reference orange).

## Approach (P3-15) — ✅ Done

- **Theme:** Dark burgundy Fixora tokens (`scss/variables.scss`) — matches customer app
- **Layout:** Reference screenshots 1:1 (sidebar, header, tables, verification detail panel)
- **Base:** New `AdminLayout` + `AdminSidebar` + `AdminHeader` (replaced legacy Nestar `LayoutAdmin`)

## MVP Screens

| ID | Screen | Route | Status |
|----|--------|-------|--------|
| P3-15a | Admin shell + menu | `/_admin` | ✅ Done |
| P3-15b | Technician verification queue | `/_admin/verification` | ✅ Done (GAP-074 for extra filters) |
| P3-15c | Users + Bookings lists | `/_admin/users`, `/_admin/bookings` | ✅ Done |
| P3-15d | Content moderation | `/_admin/moderation` | ✅ Done (GAP-075 comments tab) |
| — | Dashboard | `/_admin` | ✅ Partial (GAP-071/072/073) |
| — | Payments | `/_admin/payments` | ✅ Partial (GAP-073 summaries) |
| — | Devices | `/_admin/devices` | ✅ Done |
| — | Settings | `/_admin/settings` | ✅ Partial (GAP-076 platform prefs) |

## Backend gaps

See [BACKEND_ADMIN.md](../BACKEND_ADMIN.md) and [BACKEND_GAPS.md](../BACKEND_GAPS.md) GAP-071…077.

## Verification Flow Dependency

```
Tech submits ID → Admin reviews (/_admin/verification) → Approve → Verified badge on profile
```
