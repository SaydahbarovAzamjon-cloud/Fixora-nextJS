# FixoraF — Active Session Prompt

> **For Cursor / Codex.** Execute this task. Then update `AI_HANDOFF.md` + `TASK_BOARD.md`.  
> **Created:** 2026-06-09 (synced from FixoraB backend contract)

---

## Session instructions

FixoraF frontend agent sessiyasi. Avval `AGENTS.md` va `docs/AI_HANDOFF.md` ni o‘qi.

**Muhim yangilanish:** FIXORAB (FixoraB) backend MVP tayyor — nestar emas. GraphQL: `http://localhost:2000/graphql`

**Kontrakt hujjatlari (shu repoda):**

- `docs/FRONTEND_API.md`
- `docs/AUTH_API.md`
- `docs/schema.gql`

Backend ishlab turishi kerak: FixoraB da `npm run start:dev` (port 2000).

---

## Task 1 — Google OAuth (P3-03 davomi) — **birinchi**

`libs/components/auth/SocialAuthRow.tsx` da Google hozir `disabled` + "Coming Soon" badge. Uni ishlaydigan qil:

1. Login/Register da **Continue with Google** faol bo‘lsin
2. Google GIS: `initCodeClient` + `requestCode`, `redirect_uri: postmessage`
   - GIS `renderButton` / `prompt` **ISHLATMA** — React Strict Mode da duplicate popup
3. Auth code → `loginWithOAuth({ authProvider: GOOGLE, token: code })`
4. Javob:
   - `accessToken` + `refreshToken` saqla (mavjud auth pattern)
   - `needsOnboarding === true` → `/register/role?oauth=1` → `completeOAuthSignup` (Bearer)
   - `needsOnboarding === false` → `/my-page`
5. **Apple** faqat "Coming Soon" toast — API chaqirilmasin
6. **Kakao** ham ulansin — SDK `authorize` → code → `loginWithOAuth(KAKAO)`
7. Email login: `userEmail` + password — telefon login **YO‘Q** (AUTH-07)

**Reference implementation (FixoraB repo):**

```
FixoraB/fixora-web/src/components/OAuthProviderButtons.tsx
FixoraB/fixora-web/src/components/GoogleSignInButton.tsx
FixoraB/fixora-web/src/lib/google-gis.ts
FixoraB/fixora-web/src/components/GoogleGisScript.tsx
FixoraB/fixora-web/src/graphql/auth.ts
```

Port qilganda FixoraF arxitekturasiga mosla: `libs/`, `pages/`, `apollo/user/`.

**`.env.local` (commit qilma):**

```bash
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:2000/graphql
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<FixoraB .env dagi GOOGLE_CLIENT_ID bilan bir xil>
NEXT_PUBLIC_KAKAO_JS_KEY=<Kakao JavaScript key>
NEXT_PUBLIC_WS_URL=ws://localhost:2000
```

Google Cloud Console: OAuth Web client → **Authorized JavaScript origins**: `http://localhost:3000`

`.env.local` o‘zgargach dev serverni **restart** qil.

**GraphQL (apollo/user/ ga qo‘sh):**

```graphql
mutation LoginWithOAuth($input: OAuthLoginInput!) {
  loginWithOAuth(input: $input) {
    accessToken
    refreshToken
    needsOnboarding
    user { _id userType profileComplete authProvider }
  }
}

mutation CompleteOAuthSignup($input: CompleteOAuthSignupInput!) {
  completeOAuthSignup(input: $input) {
    _id userType profileComplete verificationStatus
    accessToken refreshToken
  }
}
```

---

## Task 2 — Homepage Hero AI (P3-04) — **keyin**

Mockup: `docs/design/customer/homepage.png`

Hero qidiruv → public query `heroRepairSearch({ problemText, limit })`:

```graphql
query HeroRepairSearch($input: HeroRepairSearchInput!) {
  heroRepairSearch(input: $input) {
    classification {
      deviceType issueCategory repairComplexity confidenceScore keywords provider
    }
    recommendations {
      _id userNickname
      technician { shopName rating }
    }
  }
}
```

- AI natijani **ko‘rsat** — technician ni avtomatik tanlama (BIZ-07)
- User technician ni bosadi → profile → `createBooking`

Skills: `.cursor/skills/fixora-navbar/SKILL.md`, `fixora-ui/SKILL.md`

---

## Rules (do not break)

| Wrong | Correct |
|-------|---------|
| Phone + password login | `userEmail` + password |
| `getBoardArticles`, `BoardArticle` | `getArticles`, `Article`, `authorData` |
| AI auto-picks technician | User clicks → `createBooking` |
| `getMemberFollowings` | `getUserFollowings` |
| Real KakaoPay merchant | Mock `confirmPayment` (PAY-05) |
| New backend endpoints | Use `FRONTEND_API.md` + `schema.gql` only |

---

## Acceptance criteria

1. Google login popup → muvaffaqiyat (yangi + qaytgan user)
2. Apple: Coming Soon only, no API call
3. Kakao login works when `NEXT_PUBLIC_KAKAO_JS_KEY` set
4. Homepage Hero calls `heroRepairSearch` and shows results
5. `npm run build` passes
6. `docs/AI_HANDOFF.md` + `docs/TASK_BOARD.md` updated before session end

---

## If blocked

- Backend not running → log blocker in `AI_HANDOFF.md`; do not mock APIs forever
- Missing operation → check `docs/schema.gql`; ask FixoraB sync, do not invent fields
