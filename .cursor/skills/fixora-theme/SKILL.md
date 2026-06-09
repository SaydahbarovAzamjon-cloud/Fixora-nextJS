---
name: fixora-theme
description: >-
  Builds and updates Fixora dark/orange design tokens, MUI theme, and SCSS variables.
  Use for P3-02, colors, typography, palette, CssBaseline, theme mode, or when
  replacing legacy Nestar light theme in _app.tsx and scss/MaterialTheme/.
---

# Fixora Theme (P3-02)

## Mockup reference

- Primary source: `docs/design/auth/auth-login-signup-hifi.png`
- Tokens doc: `docs/design/README.md` § Design Tokens

## Color tokens (MVP dark)

| Token | CSS variable | Value |
|-------|--------------|-------|
| Primary | `--fixora-primary` | `#FF6B00` |
| Primary hover | `--fixora-primary-hover` | `#FF8533` |
| Background | `--fixora-bg` | `#0D0D0D` |
| Surface / card | `--fixora-surface` | `#1A1A1A` |
| Surface elevated | `--fixora-surface-elevated` | `#242424` |
| Border / glow | `--fixora-border` | `rgba(255, 107, 0, 0.35)` |
| Text primary | `--fixora-text-primary` | `#FFFFFF` |
| Text secondary | `--fixora-text-secondary` | `#A0A0A0` |
| Text muted | `--fixora-text-muted` | `#6B6B6B` |
| Error | `--fixora-error` | `#FF4D4F` |
| Success | `--fixora-success` | `#52C41A` |

## Light placeholders (Phase 4 — do not activate in MVP)

Define alongside dark tokens in `scss/variables.scss`:

```scss
--fixora-light-bg: #F5F5F7;
--fixora-light-surface: #FFFFFF;
--fixora-light-text: #181A20;
```

Use `[data-theme='light']` or `.theme-light` selector only when P4-05 starts.

## Files to edit

| File | Action |
|------|--------|
| `scss/variables.scss` | CSS custom properties + `$font` |
| `scss/MaterialTheme/index.ts` | Export `fixoraDark` palette |
| `scss/MaterialTheme/typography.ts` | Inter or Poppins — match mockup |
| `pages/_app.tsx` | Replace `light` import with `fixoraDark` |
| `scss/app.scss` | `body { background: var(--fixora-bg); color: ... }` |

## MUI palette mapping

```typescript
palette: {
  mode: 'dark',
  primary: { main: '#FF6B00', contrastText: '#FFFFFF' },
  background: { default: '#0D0D0D', paper: '#1A1A1A' },
  text: { primary: '#FFFFFF', secondary: '#A0A0A0' },
}
```

## Rules

- Never hardcode `#FF6B00` in components — use CSS variables or MUI theme
- Do not ship light theme active in MVP
- Remove legacy light Nestar defaults from global SCSS when touching theme
- Yarn only; run `yarn dev` to verify

## After completing

Update `docs/TASK_BOARD.md` P3-02 / P3-02a and `docs/AI_HANDOFF.md`.
