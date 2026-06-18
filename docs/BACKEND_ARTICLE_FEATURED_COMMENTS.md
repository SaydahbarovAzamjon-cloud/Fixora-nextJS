# FixoraB — Article Featured & Allow Comments (backend spec)

> **Repo:** `FIXORAB` / `FixoraB` (NestJS + GraphQL)  
> **Frontend:** `FixoraF` — Write Article UI tayyor; hozir `localStorage` workaround ishlatiladi  
> **Related gaps:** `GAP-083`, `GAP-084` in [BACKEND_GAPS.md](./BACKEND_GAPS.md)

---

## Muammo

Technician **Write Article** sahifasida quyidagi toggle'lar mavjud:

| UI | Mockup | Frontend holati |
|----|--------|-----------------|
| **Featured Article** | `ArticleSettingsPanel` — "Boost visibility on FIXORA" | Toggle ishlaydi; `localStorage` (`fixora_article_local_settings`) |
| **Allow Comments** | `ArticleSettingsPanel` — "Let readers engage" | Toggle ishlaydi; faqat My Articles dashboard'da comment tugmasi disable |

Backend `docs/schema.gql` (FixoraF nusxasi) da bu maydonlar **yo'q** — `createArticle` / `updateArticle` ularni saqlamaydi. Community (`/community/[id]`) har doim comment qabul qiladi.

---

## Kerakli schema o'zgarishlari

### 1. `Article` type

```graphql
type Article {
  # ... mavjud maydonlar ...
  isFeatured: Boolean!
  allowComments: Boolean!
}
```

**Default qiymatlar (yangi maqola):**

| Maydon | Default | Izoh |
|--------|---------|------|
| `isFeatured` | `false` | Faqat technician/admin yoqishi mumkin |
| `allowComments` | `true` | Mockup default — comment ochiq |

### 2. `ArticleInput` (createArticle)

```graphql
input ArticleInput {
  articleCategory: ArticleCategory
  articleContent: String!
  articleExcerpt: String
  articleImage: String
  articleStatus: ArticleStatus
  articleTitle: String!
  isFeatured: Boolean          # optional, default false
  allowComments: Boolean       # optional, default true
}
```

### 3. `ArticleUpdate` (updateArticle)

```graphql
input ArticleUpdate {
  _id: String!
  articleContent: String
  articleExcerpt: String
  articleImage: String
  articleStatus: ArticleStatus
  articleTitle: String
  isFeatured: Boolean
  allowComments: Boolean
}
```

---

## Backend business logic

### Featured Article (`isFeatured`)

1. **Saqlash:** `createArticle` / `updateArticle` — faqat maqola egasi (technician) yoki `ADMIN` o'zgartira oladi.
2. **Community feed (`getArticles`):**
   - Featured maqolalar ro'yxatning yuqorisida ko'rsatilsin (masalan: `sort: isFeatured DESC, createdAt DESC`).
   - Yoki alohida query: `getFeaturedArticles(limit: Int): [Article!]!` — frontend homepage/community uchun.
3. **Limit (tavsiya):** Bir technician uchun bir vaqtning o'zida max 1–3 ta featured — ixtiyoriy business rule.
4. **My Articles:** Frontend featured badge ko'rsatadi — backend field qaytganidan keyin `localStorage` olib tashlanadi.

### Allow Comments (`allowComments`)

1. **Saqlash:** `createArticle` / `updateArticle` — technician o'z maqolasida o'zgartira oladi.
2. **`createComment` guard (Community):**
   ```text
   IF article.allowComments === false
   THEN throw ForbiddenException / BadRequestException
        ("Comments are disabled for this article")
   ```
   - `commentGroup: ARTICLE`, `commentRefId: articleId` bo'lganda tekshirish.
3. **`getComments`:** `allowComments === false` bo'lsa ham mavjud commentlarni o'qish mumkin ( tarix ); yangi comment bloklanadi.
4. **Community detail UI (FixoraF — backend tayyor bo'lgach):**
   - `allowComments === false` → comment form yashiriladi, "Comments are disabled" xabari.
   - `pages/community/[id].tsx`, `CommentSection.tsx`.

---

## GraphQL query/mutation yangilanishlari

Quyidagi operatsiyalar javobida `isFeatured` va `allowComments` qaytarilishi kerak:

| Operatsiya | Fayl (FixoraF) |
|------------|----------------|
| `getArticle` | `apollo/user/article.ts` — `GET_ARTICLE` |
| `getArticles` | `apollo/user/query.ts` |
| `getMyArticles` | `apollo/user/profile.ts` — `GET_MY_ARTICLES` |
| `createArticle` | `apollo/user/article.ts` |
| `updateArticle` | `apollo/user/article.ts` |

**FixoraF sync:** Backend merge'dan keyin `docs/schema.gql`, `docs/FRONTEND_API.md` yangilansin.

---

## FixoraF integratsiya (backend tayyor bo'lgach)

1. **`useWriteArticleForm.ts`**
   - `createArticle` / `updateArticle` payload'ga `isFeatured`, `allowComments` qo'shish.
   - `libs/utils/articleLocalSettings.ts` workaround olib tashlash.

2. **`WriteArticlePage.tsx` (edit mode)**
   - `GET_ARTICLE` dan `isFeatured`, `allowComments` yuklash.

3. **`MyArticleCard.tsx`**
   - Featured badge — `article.isFeatured` dan.
   - Comments disabled — `article.allowComments === false`.

4. **Community**
   - `pages/community/[id].tsx` — comment form shartli render.
   - `getArticles` / homepage — featured sort yoki alohida featured section.

5. **i18n** (allaqachon mavjud)
   - `technician.writeArticle.featuredArticle`, `allowComments`
   - Community uchun yangi kalit: masalan `community.commentsDisabled`

---

## Test checklist (FixoraB)

- [ ] Yangi maqola: `allowComments` default `true`, `isFeatured` default `false`
- [ ] `createArticle({ isFeatured: true, allowComments: false })` — DB'da to'g'ri saqlanadi
- [ ] `updateArticle` — faqat egasi o'zgartira oladi
- [ ] `createComment` — `allowComments: false` bo'lsa reject
- [ ] `getArticles` — featured maqolalar yuqorida (yoki `getFeaturedArticles` ishlaydi)
- [ ] `getMyArticles` / `getArticle` — yangi maydonlar qaytadi

---

## O'zgarishlar tarixi

| Sana | Agent | O'zgarish |
|------|-------|-----------|
| 2026-06-18 | Cursor | Dastlabki spec: `isFeatured`, `allowComments`, community comment guard |
