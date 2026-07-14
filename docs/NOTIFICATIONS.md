# FixoraF — Notifications + Messages Wiring

> **Status:** Implemented 2026-06-25 · **Telegram Phase 5 UI** 2026-07-14  
> **Contract:** [`docs/FRONTEND_API.md`](./FRONTEND_API.md) (Message + Notifications + WebSocket + Telegram)  
> **Schema:** [`docs/schema.gql`](./schema.gql)

This document is the integration checklist for real-time notifications and chat in FixoraF (`fixora-next`).

---

## Architecture

| Layer | Path | Role |
|-------|------|------|
| WebSocket transport | `libs/utils/fixoraWebSocket.ts` | Single auth WS: `ws://host?token=<accessToken>` |
| Realtime context | `libs/context/NotificationContext.tsx` | Connect/disconnect on login/logout; `notificationReceived` + `messageReceived` |
| App mount | `pages/_app.tsx` | `NotificationProvider` wraps authenticated shell |
| GraphQL — notifications | `apollo/user/notification.ts` | `getNotifications`, `markNotificationRead`, … |
| GraphQL — prefs / Telegram | `apollo/user/settings.ts` | `getNotificationPreferences`, `requestTelegramLink`, `disconnectTelegram` |
| Hook | `libs/hooks/useNotificationPreferences.ts` | Prefs + connect/poll (4s) / disconnect |
| Settings UI | `NotificationsSettingsSection` | Language, channels, Telegram link, event toggles (customer + technician) |
| Signup soft card | `NotificationSetupCard` | `notificationSetup` on signup / OAuth complete |
| GraphQL — messages | `apollo/user/message.ts` | Conversations, messages, mark read |
| Navbar bell | `libs/components/layout/NotificationBell.tsx` | Badge from `NotificationContext.unreadCount` |
| Customer notifications | `pages/notifications/index.tsx` | Feed + tabs |
| Technician notifications | `pages/technician/notifications/index.tsx` | Full feed incl. `MESSAGE` |
| Messages UI | `pages/messages/index.tsx`, `pages/technician/messages/index.tsx` | `?peerId=` deep link |

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

## Telegram (Phase 5)

| Step | Behavior |
|------|----------|
| Connect | `requestTelegramLink` → `window.open(linkUrl)` → poll prefs every 4s until `LINKED` or expiry |
| Toggle | `telegramEnabled` only when `telegramStatus === LINKED` |
| Disconnect | `disconnectTelegram` → `UNLINKED` |
| Signup | Optional `notificationSetup` (language, email, telegram username intent) — bot must still be linked in Settings |

### E2E checklist (before push)

1. Login works  
2. Settings → Connect opens bot link  
3. User taps Start in bot → welcome message  
4. UI shows LINKED / connected as `@username`  
5. Telegram toggle can be enabled  
6. Trigger event (e.g. receive message) → Telegram notification arrives  
7. Disconnect → UNLINKED / delivery stops  
8. Signup soft prefs save without blocking registration  

Prefer localhost UI + `https://fixoranext.com/graphql` / `wss://…` so the production webhook receives `/start`.

---

## Integration checklist

- [x] Global realtime — `NotificationContext`
- [x] Bell badge
- [x] Messages module + MESSAGE deep link
- [x] Email / OAuth register — `notificationSetup` on signup
- [x] Customer + technician notification feeds
- [x] Telegram Settings UI — Connect / poll / Disconnect + channel toggles (Phase 5)

---

## Env

```bash
NEXT_PUBLIC_GRAPHQL_URL=https://fixoranext.com/graphql
NEXT_PUBLIC_WS_URL=wss://fixoranext.com/graphql/ws
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

(Or local FixoraB: `http://localhost:2000/graphql` + `ws://localhost:2000` — Telegram bot link then needs a reachable webhook.)

---

## Notes

- Username format validation only on signup — do not pretend Telegram Bot API can verify delivery by username alone.
- Soft signup prefs never block registration if the API rejects optional fields (wrap failures carefully in callers).
