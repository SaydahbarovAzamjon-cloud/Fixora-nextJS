# Fixora Decisions (Frontend Scope)

> **Full decisions:** [`../DECISIONS.md`](../DECISIONS.md) — **canonical; do not contradict.**  
> Synced 2026-06-18 with FixoraB `schema.gql` + `AUTH_API.md`.

## Source Priority

1. `../DECISIONS.md`
2. `../FIXORA-ANALIZ.md` §9 (UI mockups)
3. `../FIXORA-ANALIZ.md` §4.9 (ER / GraphQL field names)
4. `../FRONTEND_API.md`, `../schema.gql`
5. Existing code in `libs/`, `pages/`, `apollo/`

## Frontend-Relevant Summary

| Area | Rule |
|------|------|
| Theme | Dark, orange primary, dark glass cards (UI-06) |
| Mockups | Final — pixel-perfect (UI-01); login field = **email** (AUTH-07) |
| Auth | **Email** + password; OAuth **Google + Kakao**; Apple Coming Soon (AUTH-01…03, AUTH-07) |
| Phone | `userPhoneNumber` = contact at signup only; hidden in chat until ACCEPTED (AUTH-07, BIZ-04) |
| Service | SHOP_VISIT only; ON_SITE = Coming Soon (BIZ-01) |
| Booking | 6 statuses (BIZ-02) |
| Payment UI | KakaoPay 50/50 mock gateway (BIZ-03) |
| AI | Display only — user picks technician (BIZ-07) |
| Terminology | User / Technician / Device — migrate away from Member / Agent / Property (P3-11/12) |
| Mobile | Phase 3 PM-xx after desktop pages (MOB-01) |

## Reuse vs Replace

- **Keep:** layouts, Apollo, i18n, community, admin shell
- **Replace:** real-estate pages, property/agent naming, Nestar light theme

Backend-only items → FIXORAB repo.
