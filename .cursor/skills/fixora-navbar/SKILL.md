---
name: fixora-navbar
description: >-
  Implements Fixora navbar and header — guest vs authenticated states, logo, nav links,
  language toggle, CTA buttons. Use for Top.tsx, LayoutHome, homepage header, P3-04 navbar.
---

# Fixora Navbar

## Mockup reference

| State | Mockup |
|-------|--------|
| Guest | `docs/design/customer/homepage.png` — top header |
| Authenticated | `docs/design/customer/customer-pages-full.png` §1 Navbar states |

## Logo

| Asset | Use |
|-------|-----|
| `public/img/logo/logoWhite.png` | Full wordmark on **dark** navbar/footer |
| `public/img/logo/logoText.png` | Icon only on light panels |

- `alt="Fixora"`
- No black background on logo — PNG is transparent
- Width ~150px in navbar (`scss/pc/main.scss` `.logo-box img`)

## Guest navbar (homepage mockup)

Left → right:

1. **Logo** → link `/`
2. **Nav links:** Home (active orange underline), Services
3. **Language:** EN | KR toggle
4. **Log in** — outline/ghost button
5. **Find Technician** or **Sign up** — primary orange button

## Authenticated navbar (customer-pages-full §1)

Replace login/signup with:

- Search icon
- Notifications bell
- Messages icon
- Cart (if in mockup)
- User avatar dropdown

## Files

| File | Role |
|------|------|
| `libs/components/Top.tsx` | Main navbar component |
| `libs/components/layout/LayoutHome.tsx` | Homepage layout + Head meta |
| `scss/pc/main.scss` | `#top .navbar` styles |

## Style specs

| Element | Spec |
|---------|------|
| Background | Transparent or `#0D0D0D` / dark glass on scroll |
| Height | ~64–87px (match mockup) |
| Active link | Orange `#FF6B00` underline or text |
| Inactive links | White / gray `#A0A0A0` |
| CTA button | Use `FixoraButton` from ui-kit |

## i18n

Nav labels via `next-i18next`:

- `nav.home`, `nav.services`, `nav.login`, `nav.findTechnician`, `nav.signUp`

Add to `public/locales/ko/common.json` and `en/common.json`.

## Migration notes

- Replace Nestar nav copy and legacy light navbar colors
- Keep existing auth logic (`userVar`, `getJwtToken`, language switcher pattern)
- Routes: prepare for `/login`, `/register` (P3-03); legacy `/account/join` can redirect later

## Do not

- Copy Nestar real-estate nav items (Property, Agent, etc.) in new Fixora UI
- Add sections not in mockup

## After completing

Update P3-04 partial credit or note in `docs/AI_HANDOFF.md` if navbar done before full homepage.
