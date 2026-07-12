# Post-Signup Onboarding (Customer + Technician)

> **Status:** Implemented (2026-07-12)  
> **Routes:** `/onboarding/customer`, `/onboarding/technician`

## Flow

### Customer

```
Choose Role → Signup Form → Authentication → /onboarding/customer → (Complete | Skip) → Dashboard
```

### Technician

```
Choose Role → Signup Form → Authentication (email: ID step) → /onboarding/technician → (Complete | Skip) → Pending or Dashboard
```

OAuth new users: `loginWithOAuth` → `/register/role?oauth=1` (role preserved from Step 1 via `sessionStorage`) → `completeOAuthSignup` → onboarding route.

### OAuth sign-up (Google / Kakao)

```
/register/role → pick role (saved to sessionStorage)
      → /register or /register/technician/1 → OAuth button
      → loginWithOAuth
            ├─ existing account → error (no dashboard); tokens cleared
            └─ new stub → /register/role?oauth=1 → completeOAuthSignup → /onboarding/*
```

| Case | `needsOnboarding` | Register-mode behavior |
|------|-------------------|------------------------|
| Existing Google/Kakao account | `false` | Show provider-specific error; **do not** log in |
| New OAuth user | `true` | Complete profile stub → post-signup onboarding |

Login page OAuth is unchanged — existing users sign in normally.

## State (client-side)

| Key | Storage | Values |
|-----|---------|--------|
| `fixora_post_onboarding_{userId}` | `localStorage` | `pending` \| `completed` \| `skipped` |

- **`pending`** — set on successful signup (`fixoraCustomerSignup`, `fixoraTechnicianSignup`, `fixoraCompleteOAuthSignup`). User is redirected to onboarding and blocked from other routes until they complete or skip.
- **`skipped`** — user chose “Skip for Now”. App is fully usable; profile marked incomplete; reminder banner in Settings.
- **`completed`** — onboarding form saved or profile saved from Settings.

Helpers: `libs/auth/postSignupOnboarding.ts`  
Routing: `libs/utils/postAuthDestination.ts`, `libs/utils/onboardingRoutes.ts`

## Navigation guards

| Layer | Behavior |
|-------|----------|
| `AppShell` | Logged-in user with `pending` → forced to role-specific onboarding path (exempt: `/login`, `/register/*`, `/onboarding/*`) |
| `LayoutAuth` | Authenticated users leaving auth pages → `resolvePostAuthDestination` (onboarding first when pending) |
| `LayoutOnboarding` | Requires JWT; `completed` → dashboard; wrong role path → corrected |

## Customer onboarding fields

Saved via `updateUser` (`UPDATE_USER`):

| Field | GraphQL |
|-------|---------|
| Profile photo | `userProfileImage` |
| Location | `userLocation` (+ Kakao map pin locally; coords not stored on customer `UserUpdate`) |
| Bio | `userBio` |

## Technician onboarding fields

Saved via `updateUser` / `UPDATE_TECHNICIAN_SETTINGS` (same mutation as technician settings):

| Field | GraphQL |
|-------|---------|
| Profile photo | `userProfileImage` |
| Shop name | `shopName` |
| Repair specializations | `specialty` — comma-separated `DeviceCategory` values (`IPHONE`, `IPAD`, `MACBOOK`, `APPLE_WATCH`) |
| Years of experience | `yearsExperience` |
| Location + coords | `userLocation`, `shopLatitude`, `shopLongitude` |
| Bio | `userBio` |
| Certifications | `certifications` |
| Services | `services` (`title`, `basePrice`) |
| Working hours | `workingHours` (`days`, `startTime`, `endTime`) |
| Portfolio | `portfolioImages` |
| ID document | `verificationDocuments` + optional `submitTechnicianVerification` |

**Not in schema (omitted):** service radius and any other unsupported fields.

**Specializations UI:** `DeviceCategoryPicker` in onboarding + technician settings; public profile reads categories from `specialty` (+ legacy inference from `services.title`).

## Skip behavior

- **Customer:** `markPostSignupOnboardingSkipped` → home (`resolvePostAuthDestination`).
- **Technician:** skip → `getTechnicianAfterOnboardingPath` → `/register/technician/pending` if not `APPROVED`, else technician dashboard.
- Reminder: `OnboardingReminderBanner` on `/client/my-page` (profile) and `/technician/settings` (profile) when status is `pending` or `skipped`.
- Completing profile in Settings also calls `markPostSignupOnboardingCompleted`.

## Complete later

| Role | Settings path |
|------|----------------|
| Customer | `/client/my-page?tab=settings&section=profile` |
| Technician | `/technician/settings?section=profile` |

Banner CTA links to `/onboarding/customer` or `/onboarding/technician`.

## Key files

| File | Purpose |
|------|---------|
| `pages/onboarding/customer.tsx` | Customer onboarding page |
| `pages/onboarding/technician.tsx` | Technician onboarding page |
| `libs/components/onboarding/*` | Forms + reminder banner |
| `libs/components/layout/LayoutOnboarding.tsx` | Auth-styled layout + guards |
| `libs/auth/fixoraAuth.ts` | Marks `pending` after signup mutations |

## i18n

Namespace: `auth` — keys under `onboarding.*` in `public/locales/{en,kr}/auth.json`.
