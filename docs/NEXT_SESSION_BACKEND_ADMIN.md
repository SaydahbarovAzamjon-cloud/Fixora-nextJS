# NEXT SESSION — FIXORAB Admin APIs (GAP-071…077)

> **Repo:** Open `FixoraB` (Desktop) — NOT FixoraF  
> **Spec:** [BACKEND_ADMIN.md](./BACKEND_ADMIN.md)  
> **Frontend waiting:** FixoraF `/_admin/*` — gap banners until APIs ship

## Copy-paste prompt for FIXORAB agent

```
FIXORAB — Implement Admin Panel Backend APIs GAP-071…077.

Read first:
- FixoraB/docs/BACKEND_ADMIN.md (sync from FixoraF if missing)
- FixoraF/docs/BACKEND_GAPS.md GAP-071…077

FixoraF admin UI is DONE — no mocks. Implement GraphQL ops below.
All require Bearer + UserType.ADMIN.

Priority:
1. getAdminDashboardStats + getAdminPaymentSummary (GAP-071, GAP-073)
2. getAdminRecentActivity + TVISearch.verificationStatus (GAP-072, GAP-074)
3. getAllCommentsByAdmin + platform settings (GAP-075, GAP-076)
4. adminGlobalSearch (GAP-077)

After each gap: export schema.gql → sync FixoraF docs/schema.gql + FRONTEND_API.md
Tell FixoraF agent which GAP is DONE for Apollo wiring.

Start: apps/fixora-api/src/components/admin/ (new module)
Reuse: @Roles(ADMIN) + RolesGuard, $facet pagination pattern.
```

## After backend ships

FixoraF agent task: `sync-frontend` — wire `apollo/admin/`, remove `AdminGapBanner` per completed GAP.
