# Fixora Frontend Skills

This file tracks practical skills and workflows for the Fixora Next.js frontend (`FixoraF`).

**Cursor + Codex:** read `docs/AI_HANDOFF.md` first; update it before ending your session so the other tool can continue.

## Core Stack

- Next.js pages router, layouts, and component structure
- Apollo Client queries, mutations, and cache
- TypeScript-first React development
- Material UI + SCSS styling conventions
- next-i18next localization (KO/EN/RU)
- Environment configuration (`NEXT_PUBLIC_*`, API URL)

## Development Workflow

- Read existing patterns before adding new abstractions
- Keep changes scoped to the requested feature or fix
- Prefer typed APIs and shared helpers already present in the repo
- Add tests when behavior changes or risk is meaningful
- Avoid unrelated formatting or refactors

## Frontend Focus Areas

- GraphQL query/mutation integration via Apollo Client
- Auth flows (JWT in cookies/localStorage, protected routes)
- Pixel-perfect UI per `docs/FIXORA-ANALIZ.md` §9 mockups
- Dark/orange Fixora theme (replacing nestar real-estate UI)
- WebSocket chat UI (booking-scoped messaging)
- Form validation, SweetAlert2, Toast UI Editor

## Quality Checklist

- Code builds successfully
- Types pass without errors
- Relevant tests pass
- GraphQL operations are documented or discoverable
- Edge cases and failure states are handled
- No secrets or local-only config are committed

## Notes

- **Backend API:** separate repo (`FIXORAB`) — connect via `NEXT_PUBLIC_API_GRAPHQL_URL`
- **Current state:** nestar real-estate UI — transform to Fixora repair marketplace
- **Run dev:** `yarn dev` · **Build:** `yarn build`
- See `AGENTS.md` and `docs/AI_HANDOFF.md` before starting work
