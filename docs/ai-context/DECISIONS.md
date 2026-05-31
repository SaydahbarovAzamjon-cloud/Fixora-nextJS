# Fixora Decisions (Frontend Scope)

> **Full decisions:** [`../DECISIONS.md`](../DECISIONS.md)  
> Shared by Cursor and Codex. Do not contradict approved decisions.

## Source Priority (This Repo)

1. `../DECISIONS.md`
2. `../FIXORA-ANALIZ.md` §9 (UI mockups — **primary for frontend work**)
3. `../FIXORA-ANALIZ.md` §4.9 (ER — for GraphQL field names/types only)
4. Existing code in `libs/`, `pages/`, `apollo/`

## Frontend-Relevant Decisions (Summary)

| Area | Rule |
|------|------|
| Theme | Dark, orange primary, dark glass cards (UI-06) |
| Mockups | Final — pixel-perfect, no redesign (UI-01) |
| Auth UI | Phone + Kakao; role selection; tech onboarding (UI-02, AUTH-*) |
| Service | SHOP_VISIT only; ON_SITE = "Coming Soon" UI (BIZ-01) |
| Booking UI | 6 statuses only (BIZ-02) |
| Payment UI | KakaoPay 50/50 (BIZ-03) |
| Phone in UI | Hide until booking ACCEPTED (BIZ-04) |
| Reviews UI | Only on COMPLETED bookings (BIZ-05) |
| Terminology | User / Technician / Device — not Member / Agent / Property |

## Reuse (Frontend)

- Keep: layouts, Apollo setup, i18n, community/article components, admin shell
- Replace: real-estate pages, property/agent naming, light theme, property filters

## Open (Frontend)

- Kakao OAuth client IDs / redirect URLs for dev
- KakaoPay frontend SDK keys when payment UI is built
- Admin UI — no mockup; build incrementally (UI-05)

Backend-only open items → see FIXORAB docs.
