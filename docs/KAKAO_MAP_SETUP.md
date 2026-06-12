# Kakao Map setup (Search LocationCard)

## Console checklist

1. [Kakao Developers](https://developers.kakao.com) → your app
2. **앱 설정 > 플랫폼** → Web → add `http://localhost:3000` and production origin
3. **제품 설정** → enable **Kakao Map** (separate from Kakao Login)
4. Copy **JavaScript 키** into `.env.local`:

```bash
NEXT_PUBLIC_KAKAO_JS_KEY=<javascript-key>
```

5. Restart dev server: `yarn dev`

## Verify

- Open `/search` → Location card shows real map (not orange-dot grid fallback)
- DevTools Network: `dapi.kakao.com/v2/maps/sdk.js` returns **200**
- Allow browser geolocation when prompted

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Static grid + dots (fallback) | Key missing, Map API disabled, or domain not whitelisted |
| Map loads, label stuck | Geocoder needs `libraries=services` (already in `libs/kakao-maps.ts`) |
| No technician pins | Backend must return `shopLatitude` / `shopLongitude` — run FIXORAB backfill |
| DevTools console `[KakaoMap] initMap` | Open Kakao Developers → **제품 설정** → enable **Kakao Map** (not only Login) |
| Script loads but map blank | Add `http://localhost:3000` under **앱 설정 > 플랫폼 > Web** |

## Backend check (FixoraB)

Technicians need coordinates in MongoDB:

```bash
node apps/fixora-api/scripts/backfill-shop-coordinates.mjs
```

GraphQL smoke test:

```graphql
query {
  getTechnicians(input: { page: 1, limit: 10, search: { isOnline: null } }) {
    metaCounter { total }
    list { shopLatitude shopLongitude userLocation }
  }
}
```

Search page sends `isOnline: null` so offline technicians appear. Geo filter uses `latitude` / `longitude` / `radiusKm` from GPS.
