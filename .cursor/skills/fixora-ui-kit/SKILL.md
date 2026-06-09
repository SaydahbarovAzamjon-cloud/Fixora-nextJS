---
name: fixora-ui-kit
description: >-
  Creates Fixora shared UI components — Button, Input, GlassCard, KakaoButton — pixel-perfect
  from auth mockups. Use for P3-02b, form fields, cards, CTAs, glass panels, or libs/components/ui/.
---

# Fixora UI Kit (Button · Input · Card)

## Mockup reference

- `docs/design/auth/auth-login-signup-hifi.png` — login + signup forms
- `docs/design/customer/homepage.png` — chips, search bar, CTA buttons
- Theme tokens: apply `.cursor/skills/fixora-theme/SKILL.md`

## Folder

Create shared components in `libs/components/ui/`:

```
libs/components/ui/
├── FixoraButton.tsx
├── FixoraInput.tsx
├── FixoraGlassCard.tsx
├── FixoraKakaoButton.tsx
└── index.ts
```

Reuse MUI `@mui/material` primitives; style with SCSS module or `sx` + CSS variables.

---

## FixoraButton

| Variant | Mockup use |
|---------|------------|
| `primary` | Orange gradient — "Log In", "Create Account", "Find technician" |
| `outline` | Transparent + orange or white border — "Log in" nav |
| `ghost` | Text only links |

**Primary specs:**
- Background: linear-gradient orange (`#FF6B00` → `#E55A00`)
- Border-radius: `12px`
- Padding: `14px 24px`
- Font-weight: 600
- Full width on auth forms
- Hover: slightly brighter; disabled: opacity 0.5

---

## FixoraInput

From auth mockup login/signup fields:

| Part | Spec |
|------|------|
| Container | Dark fill `#1A1A1A`, border `1px solid rgba(255,107,0,0.3)` |
| Border-radius | `12px` |
| Left icon | Envelope, user, lock (MUI icons) — muted gray |
| Placeholder | `#6B6B6B` |
| Focus | Orange border glow |
| Password | Eye toggle on right |

Props: `label`, `type`, `icon`, `error`, `helperText`, spread to MUI `TextField` or native input.

**Auth fields:** email (not phone), password, full name, confirm password.

---

## FixoraGlassCard

Dark glass panel wrapping auth forms and content sections.

| Property | Value |
|----------|-------|
| Background | `rgba(26, 26, 26, 0.85)` |
| Border | `1px solid rgba(255, 107, 0, 0.25)` |
| Border-radius | `16px` |
| Box-shadow | subtle orange outer glow |
| Padding | `32px` desktop, `24px` mobile |

Use for auth card, dashboard stat cards, modal panels.

---

## FixoraKakaoButton

- Full width, dark background `#1A1A1A`
- Border `1px solid rgba(255,255,255,0.15)`
- Yellow Kakao icon + "Continue with Kakao" / "Sign Up with Kakao"
- i18n keys in `public/locales/ko/` and `en/`

---

## i18n

No hardcoded strings. Add keys to `common.json` under `ui.*` namespace.

---

## Do not

- Restyle legacy `PropertyCard`, `AgentCard` — build new Fixora components
- Use Nestar light input styles
- Skip accessibility (labels, `aria-*` on inputs)

## After completing

Mark P3-02b done in `docs/TASK_BOARD.md`.
