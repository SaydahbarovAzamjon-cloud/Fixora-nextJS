# Story Create Frontend — Implementation Guide

> **Purpose:** Technician screen for posting a 24-hour story (1–5 images + optional caption).
> **Status:** Backend ✅ complete · Frontend ✅ **Done** (2026-06-17 — DECISIONS UI-10)
> **Implemented in:** `apollo/user/story.ts`, `libs/components/technician/CreateStoryModal.tsx`, `/technician/profile` story ring
> **Related docs:** `FRONTEND_API.md`, `DECISIONS.md` UI-10, `AI_HANDOFF.md`

---

## Feature Overview

Only **APPROVED technicians** can create stories. A story holds 1–5 ordered images and an optional caption (≤ 200 chars), and auto-expires 24 hours after creation.

```
FLOW:
┌──────────────────────────────────────────────────────────┐
│ 1. Technician picks 1–5 images from device               │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ 2. Upload images → imagesUploader(target: "story")       │
│    Returns: ["uploads/story/uuid1.jpg", ...]             │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ 3. Build images[] with { url, order } + caption          │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│ 4. createStory(input) → Story (active for 24h)           │
└──────────────────────────────────────────────────────────┘
```

> ⚠️ **Two-step flow:** images are uploaded **first** (multipart) to get URLs, **then** `createStory` is called with those URLs. `createStory` itself does **not** accept files.

---

## Backend API (Already ✅ Implemented)

### Step A — Upload images (multipart)

```graphql
mutation ImagesUploader($files: [Upload!]!, $target: String!) {
  imagesUploader(files: $files, target: $target)   # returns [String!]
}
```

- `target` **must be** `"story"` (now whitelisted in `allowedUploadTargets`).
- Allowed mime types: `image/png`, `image/jpg`, `image/jpeg`.
- Returns an array of relative URLs, e.g. `["uploads/story/ab12.jpg", "uploads/story/cd34.jpg"]`.
- Requires `Authorization: Bearer <token>` (any logged-in user; createStory enforces the technician role next).
- Multipart upload — FixoraF uses **axios multipart** with `apollo-require-preflight` (same pattern as `AddNewProperty.tsx`), not `apollo-upload-client`.

### Step B — Create the story

```graphql
mutation CreateStory($input: CreateStoryInput!) {
  createStory(input: $input) {
    _id
    userId
    images { url order }
    caption
    viewCount
    reportCount
    createdAt
    expiresAt
    isExpired
  }
}
```

**`CreateStoryInput`:**

```graphql
input CreateStoryInput {
  images: [StoryImageInput!]!   # 1–5 items, required
  caption: String               # optional, max 200 chars
}

input StoryImageInput {
  url: String!                  # from imagesUploader
  order: Int!                   # display order (e.g. 1..N)
}
```

**Auth / role:** `createStory` requires a JWT **and** `UserType.TECHNICIAN` whose `verificationStatus === APPROVED`. Otherwise:

| Condition | Error |
|-----------|-------|
| No / expired token | 401 Unauthorized |
| Not a TECHNICIAN | 403 Forbidden |
| Technician not APPROVED | 403 Forbidden (`Only verified technicians can create stories`) |
| 0 images | 400 `Minimum 1 image required` |
| > 5 images | 400 `Maximum 5 images per story` |
| Caption > 200 chars | 400 Bad Request |

### Reading stories back

```graphql
# Homepage carousel (public)
query { getStoriesCarousel(input: { limit: 10 }) {
  list { _id userData { _id nickname memberImage } images { url order } caption createdAt }
  metaCounter { total }
} }

# One technician's stories (public)
query { getTechnicianStories(input: { technicianId: "...", limit: 10 }) {
  list { _id images { url order } caption viewCount createdAt expiresAt }
  metaCounter { total }
} }
```

> Public queries only return **active** stories (`isExpired: false`, not soft-deleted). After 24h a batch job flips `isExpired`, so the story drops out automatically.

---

## GraphQL Documents (frontend)

```typescript
import { gql } from '@apollo/client'

export const IMAGES_UPLOADER = gql`
  mutation ImagesUploader($files: [Upload!]!, $target: String!) {
    imagesUploader(files: $files, target: $target)
  }
`

export const CREATE_STORY = gql`
  mutation CreateStory($input: CreateStoryInput!) {
    createStory(input: $input) {
      _id
      images { url order }
      caption
      viewCount
      createdAt
      expiresAt
      isExpired
    }
  }
`
```

> **Upload in FixoraF:** multipart **axios** with `apollo-require-preflight` header (see `AddNewProperty.tsx` / `CreateStoryModal.tsx`) — not `apollo-upload-client`.

---

## Custom Hook — `useCreateStory()`

Encapsulates the two-step upload → create flow and prefixes URLs with the API host for rendering.

```typescript
const API_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN ?? 'http://localhost:2000'

export function useCreateStory() {
  const [uploadImages] = useMutation(IMAGES_UPLOADER)
  const [createStoryMut, { loading }] = useMutation(CREATE_STORY)

  async function createStory(files: File[], caption?: string) {
    if (files.length < 1) throw new Error('Minimum 1 image required')
    if (files.length > 5) throw new Error('Maximum 5 images per story')

    // Step A: upload → URLs (order preserved by the resolver)
    const { data } = await uploadImages({
      variables: { files, target: 'story' },
    })
    const urls: string[] = data.imagesUploader

    // Step B: build ordered images + create
    const images = urls.map((url, i) => ({ url, order: i + 1 }))
    const res = await createStoryMut({
      variables: { input: { images, caption: caption?.trim() || null } },
    })
    return res.data.createStory
  }

  return { createStory, loading }
}

// Render helper: relative -> absolute
export const storyImageUrl = (url: string) =>
  url.startsWith('http') ? url : `${API_ORIGIN}/${url}`
```

---

## Frontend Components to Build

### 1. `<StoryImagePicker />`

**Purpose:** Pick/reorder 1–5 images with live previews.

```
┌─────────────────────────────────────────────────┐
│  Add to your story                              │
├─────────────────────────────────────────────────┤
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐            │
│  │ 1  │ │ 2  │ │ 3  │ │ +  │ │    │            │
│  │[x] │ │[x] │ │[x] │ │    │ │    │            │
│  └────┘ └────┘ └────┘ └────┘ └────┘            │
│  Max 5 images • PNG/JPG only                    │
└─────────────────────────────────────────────────┘
```

- Validate count (1–5) and mime (`image/png|jpg|jpeg`) **before** upload.
- Optional client-side compression/resize to keep uploads fast.
- Allow drag-to-reorder; the array index defines `order`.

### 2. `<StoryCaptionInput />`

- Multiline, `maxLength={200}` with a live `n/200` counter.
- Caption is optional — empty is fine.

### 3. `<CreateStoryModal />`

```typescript
export function CreateStoryModal({ open, onClose, onCreated }: Props) {
  const [files, setFiles] = useState<File[]>([])
  const [caption, setCaption] = useState('')
  const { createStory, loading } = useCreateStory()
  const { showToast } = useToast()

  async function handleSubmit() {
    try {
      const story = await createStory(files, caption)
      showToast('Story posted! 🎉', 'success')
      onCreated?.(story)
      onClose()
    } catch (e: any) {
      showToast(e.message ?? 'Failed to post story', 'error')
    }
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>New Story</DialogTitle>
      <DialogContent>
        <StoryImagePicker value={files} onChange={setFiles} max={5} />
        <StoryCaptionInput value={caption} onChange={setCaption} max={200} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          loading={loading}
          disabled={files.length < 1 || loading}
          variant="contained"
        >
          Share Story
        </Button>
      </DialogActions>
    </Dialog>
  )
}
```

**Gate the entry point:** only render the "＋ Story" button for `userType === TECHNICIAN && verificationStatus === APPROVED`. The server enforces this too, but hiding it avoids a guaranteed 403.

---

## Error Handling & Edge Cases

```typescript
// Map server errors to friendly toasts
const MSG: Record<string, string> = {
  'Minimum 1 image required': 'Add at least one image.',
  'Maximum 5 images per story': 'You can add up to 5 images.',
  'Only verified technicians can create stories':
    'Your technician account must be approved first.',
}
function toFriendly(err: any) {
  const raw = err?.graphQLErrors?.[0]?.message ?? err?.message ?? ''
  return MSG[raw] ?? 'Something went wrong. Please try again.'
}
```

- **Partial upload failure:** `imagesUploader` skips failed files; if `urls.length < files.length`, warn the user and let them retry rather than posting a partial story.
- **Large files / slow network:** show a per-image upload progress and disable Submit until uploads resolve.
- **Wrong mime:** block at the picker; the server returns `Please provide allowed image format`.

---

## Testing Checklist

- [ ] "＋ Story" only visible to APPROVED technicians
- [ ] Pick 1 image → upload → createStory → success toast
- [ ] Pick 5 images, reorder → `order` reflects final order
- [ ] 6th image blocked client-side
- [ ] Caption counter stops at 200
- [ ] Empty caption still posts
- [ ] Non-image file rejected at picker
- [ ] 403 path (unapproved technician) shows friendly message
- [ ] Newly created story appears in `getTechnicianStories` / carousel
- [ ] Relative URLs render via `storyImageUrl()` host prefix
- [ ] Story disappears from feeds ~24h after creation

---

## Dependencies & Imports

```typescript
import { gql, useMutation } from '@apollo/client'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material'
// Upload: axios multipart — see CreateStoryModal.tsx / AddNewProperty.tsx
```

---

## References

| Doc | Purpose |
|-----|---------|
| [STORIES_FEATURE.md](STORIES_FEATURE.md) | Feature spec & lifecycle |
| [STORIES_CREATE_FLOW_DETAIL.md](STORIES_CREATE_FLOW_DETAIL.md) | Backend step-by-step flow |
| [FRONTEND_API.md](FRONTEND_API.md) | GraphQL schema reference |
| [BOOKING_ACCEPT_REJECT_FRONTEND.md](BOOKING_ACCEPT_REJECT_FRONTEND.md) | Sibling frontend guide |

---

**Implementation complete.** Story viewer/playback (tap ring to view slides) is **not** built yet — display covers + create only (see `AI_HANDOFF.md` blockers).
