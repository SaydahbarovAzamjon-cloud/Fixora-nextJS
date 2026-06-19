# Technician Public Profile — Data & Logic Audit

> Routes: `/technician/profile` (owner) · `/technicians/[id]` (visitor)  
> Component: `libs/components/technician-profile/TechnicianPublicProfileView.tsx`

---

## Routes

| Route | Page file | Variant | `technicianId` source |
|-------|-----------|---------|------------------------|
| `/technician/profile` | `pages/technician/profile/index.tsx` | `owner` | `userVar._id` (logged-in technician) |
| `/technicians/[id]` | `pages/technicians/[id].tsx` | `visitor` | `router.query.id` |

Both render the same `TechnicianPublicProfileView` with different CTA/follow behaviour.

---

## GraphQL operations

| Section | Owner query | Visitor query | Variables |
|---------|-------------|---------------|-----------|
| Profile header | `GetUser` | `GetUser` | `{ userId }` |
| Articles (overview) | `GetMyArticles` | `GetArticles` | owner: `{ page:1, limit:6, search:{} }` · visitor: `{ search:{ userId } }` |
| Reviews | `GetTechnicianReviews` | same | `{ search:{ technicianId } }` |
| Followers | `GetUserFollowers` | same | `{ search:{ followingId: technicianId } }` |
| Stories | `GetTechnicianStories` | same | `{ technicianId, limit:20 }` |

**Fetch policy:** `GetUser` uses `network-only` (always fresh name/avatar). Other queries use `cache-and-network`.

**Mutations on this page:**

| Action | Mutation | Auth |
|--------|----------|------|
| Follow / unfollow | `subscribe` / `unsubscribe` | Bearer |
| Article like | `likeTargetArticle` | Bearer |

---

## Display name rules

Helpers: `libs/utils/technicianProfileDisplay.ts`

| UI field | Rule |
|----------|------|
| **Title (h1)** | `shopName` → `userNickname` → `userFullName` → `"Technician"` |
| **Subtitle** (under title) | Only when `shopName` exists: show `userNickname` if set and ≠ title, else `userFullName` if ≠ title |
| **Avatar** | `resolveProfileImageUrl(userProfileImage)`; owner may show `profileImageDraftVar` preview before save |

### Name change (Settings → Profile)

Editable in **Settings → Profile Settings**:

- **Business / Shop Name** → `shopName` (big title on cards + profile)
- **Full Name** → `userFullName` (subtitle when shop name is set)
- **Account → Username** → `userNickname` (subtitle priority over full name)

Save mutation: `updateUser` via `UPDATE_TECHNICIAN_SETTINGS`. On save:

- Refetches `GetUser` + `GetTechnicians` (homepage cards)
- Syncs `userVar` via `syncUserVarFromGraphqlUser`

If the homepage still shows an old subtitle after save, hard-refresh once; if it persists, check FixoraB `getTechnicians` returns updated `userFullName` / `shopName`.

---

## Articles section (overview tab)

Component: `ProfileArticleCard.tsx`

| Feature | Implementation |
|---------|----------------|
| Open article | Whole card links to `/community/[articleId]` |
| Like | `likeTargetArticle` — toggles `articleLikes` + `meLiked` |
| Save | **No backend API** (GAP-085) — `localStorage` key `fixora_saved_articles` |
| Stats | `articleLikes`, `articleViews`, `articleComments` from query |

Queries request `meLiked { myFavorite }` for like button state.

---

## Tabs & static UI

| Tab | Data source | Notes |
|-----|-------------|-------|
| Overview | API + static credential/specialization cards | Credential pills partly static (mock labels) |
| Services | `profile.services[]` | `title`, `basePrice` |
| Portfolio | `profile.portfolioImages[]` | Image grid |
| Reviews | `getTechnicianReviews` | Star distribution + list |

---

## Owner-only actions

- Edit profile → `/technician/settings`
- View live profile → opens `/technicians/[id]` in new tab
- Messages → `/technician/messages`
- Create story (if `verificationStatus === APPROVED`)

## Visitor actions

- Follow / Message / Book service
- Back link → `/search`

---

## Related files

```
libs/components/technician-profile/
  TechnicianPublicProfileView.tsx
  ProfileArticleCard.tsx
libs/utils/technicianProfileDisplay.ts
libs/utils/savedArticles.ts
apollo/user/query.ts          — GET_USER, GET_ARTICLES, GET_TECHNICIAN_REVIEWS
apollo/user/profile.ts        — GET_MY_ARTICLES, GET_USER_FOLLOWERS
apollo/user/article.ts        — LIKE_TARGET_ARTICLE
apollo/user/story.ts          — GET_TECHNICIAN_STORIES
scss/pc/technician/technician-profile.scss
```

---

## Known gaps

| ID | Item |
|----|------|
| GAP-085 | Article save/bookmark — localStorage only |
| — | Credential badges on overview are not fully API-driven |
| — | `TechnicianCard` on homepage links to legacy `/agent/detail` (separate task) |
