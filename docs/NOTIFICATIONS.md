# FixoraF — Notifications + Messages Wiring

> **Status:** Implemented 2026-06-25  
> **Contract:** [`docs/FRONTEND_API.md`](../FRONTEND_API.md) (Message + Notifications + WebSocket)  
> **Schema:** [`docs/schema.gql`](../schema.gql)

This document is the integration checklist for real-time notifications and chat in FixoraF (`fixora-next`).

---

## Architecture

| Layer | Path | Role |
|-------|------|------|
| WebSocket transport | `libs/utils/fixoraWebSocket.ts` | Single auth WS: `ws://host?token=<accessToken>` |
| Realtime context | `libs/context/NotificationContext.tsx` | Connect/disconnect on login/logout; `notificationReceived` + `messageReceived` |
| App mount | `pages/_app.tsx` | `NotificationProvider` wraps authenticated shell |
| GraphQL — notifications | `apollo/user/notification.ts` | `getNotifications`, `markNotificationRead`, … |
| GraphQL — messages | `apollo/user/message.ts` | `getMyConversations`, `getMessages`, `sendMessage`, `markMessagesAsRead` |
| Navbar bell | `libs/components/layout/NotificationBell.tsx` | Badge from `NotificationContext.unreadCount` |
| Customer notifications | `pages/notifications/index.tsx` | Feed + tabs (All \| Messages \| Bookings) |
| Technician notifications | `pages/technician/notifications/index.tsx` | Full feed incl. `MESSAGE` |
| Messages UI | `pages/messages/index.tsx`, `pages/technician/messages/index.tsx` | `?peerId=` deep link |
| Deep links | `libs/utils/notifications.ts` → `getNotificationLink()` | `MESSAGE` → `/messages?peerId={notification.userId}` |

### WebSocket events (frozen)

```json
{ "event": "notificationReceived", "data": Notification }
{ "event": "messageReceived", "data": Message }
```

- **Do not** open multiple WebSocket connections.
- Polling fallback: `useRealtimePollInterval` returns `0` when WS connected.

---

## MESSAGE_RECEIVED notification

| Field | Usage |
|-------|--------|
| `notificationType` | `MESSAGE` |
| `referenceType` | `MESSAGE` |
| `referenceId` | Message `_id` — **not** used for navigation |
| `userId` | Sender id → **`peerId` deep link** |
| `notificationDescription` | Message preview text |

Gated server-side by `notificationPreferences.messages`.

---

## Integration checklist

- [x] **Global realtime** — `NotificationContext` handles both WS events; reconnect on login, close on logout
- [x] **Bell badge** — `NotificationBell` + `Top.tsx`; count updates on `notificationReceived` without visiting `/notifications`
- [x] **Messages module** — GraphQL ops in `apollo/user/message.ts`; hooks `usePeerMessages`; pages `/messages`, `/technician/messages`
- [x] **MESSAGE deep link** — Tap notification → `/messages?peerId={userId}` + `markNotificationRead`; thread open → `markMessagesAsRead({ peerId })`
- [x] **Live thread** — `usePeerMessages` subscribes to `messageReceived`; conversation list refetches on WS
- [x] **Email register** — `NotificationSetupCard` on `/register` → `updateNotificationPreferences` after `signup`
- [x] **Customer feed tabs** — All \| Messages \| Bookings on `/notifications`
- [x] **Technician routes** — `/technician/messages`, `/technician/notifications` (existing aliases)
- [x] **OAuth signup** — `NotificationSetupCard` on `/register/role?oauth=1` → `updateNotificationPreferences` after `completeOAuthSignup`
- [x] **Technician chat WS** — `/technician/messages` uses `usePeerMessages` + conversation refetch on `messageReceived`
- [x] **Technician bell** — header/sidebar badge via `NotificationContext.unreadCount`
- [x] **Automated tests** — `libs/utils/notifications.test.ts` + `scripts/test-message-notifications.mjs`

---

## Automated verification

```bash
npm run typecheck
npm run test -- libs/utils/notifications.test.ts
npm run test:messages   # GraphQL + WebSocket against FixoraB :2000
```

**Last run (2026-06-25):** `test:messages` PASSED — signup → sendMessage → WS `messageReceived` + `notificationReceived` → unread MESSAGE in API → `peerId` deep link → mark read.

**Known backend note:** With `updateNotificationPreferences({ messages: false })`, FixoraB may still persist/emit MESSAGE notifications (frontend prefs UI is wired correctly).

1. Two browsers: customer (USER) + technician (TECHNICIAN)
2. Customer sends message → technician sees `messageReceived` + `notificationReceived`
3. Bell badge increments without opening `/notifications`
4. Tap MESSAGE notification → correct chat thread with sender
5. Mark read → badge decrements
6. Disable **Messages** in settings → no new `MESSAGE` notifications (backend gate — ⚠️ verify on FixoraB; frontend calls `updateNotificationPreferences` correctly)

---

## Env

```bash
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:2000/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:2000
```

---

## Notes / blockers

- `CompleteOAuthSignupInput` has **no** `notificationSetup` field in `schema.gql`; prefs are applied via `updateNotificationPreferences` immediately after OAuth completion.
- Notification actor is schema field `userId` (not a nested `actor` object).
- Legacy `FixoraWebSocketBridge` / `useFixoraWebSocket` superseded by `NotificationContext` (safe to remove in a later cleanup).
