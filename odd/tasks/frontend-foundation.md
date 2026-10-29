# Feature: Storefront Foundation (Fase 1)

## Objective

Stand up the frontend foundation for the AltaCocina storefront: Tailwind CSS v4, the warm gastronomic design system replacing the dark "LUXE Store" tokens, and the shadcn/ui primitive set, all building green on Next.js 16 / React 19 / Turborepo.

## Problem

The backend domain layer (10 managers + API routes) exists, but `apps/web` still shows the Turborepo starter demo. There is no UI infrastructure to build the B2B storefront (gastronomy equipment for pollerias, cafeterias, pizzerias; vendors with sales-only access) on top of.

## Why

User decision: Tailwind v4 + shadcn/ui evaluated and chosen over Mantine/MUI for code ownership, zero runtime, and native Token migration; new gastronomic identity chosen over keeping the dark luxury tokens.

## Scope

In scope (Phase 1):
- Tailwind CSS v4 installed and wired via PostCSS in `apps/web`.
- Gastronomic design tokens in `@theme` (shadcn-compatible semantic scale + warm palette).
- shadcn/ui primitives generated into `apps/web/components/ui`.
- `/design-preview` smoke page demonstrating tokens + primitives.
- Work-unit commits on `feat/frontend-foundation`.

Out of scope (later phases, tracked separately):
- Store shell, catalog, cart/checkout, accounts, vendor roles (Phases 2-5).
- Real persistence for managers (project Phase 2 risk note).
- Removing the Turborepo demo page (Phase 2 replaces it).

## Constraints

- Do not break the existing domain code in `apps/web/lib` and `apps/web/app/api`.
- Keep legacy LUXE CSS variables usable (demo `page.module.css` still references them) until Phase 2 removes the demo page.
- Primitives live at `apps/web/components/ui` (pragmatic monorepo shortcut); brand-shared components may move to `packages/ui` later once stable.
- Node 26, npm 11, Windows. Offline-friendly fallback: if the shadcn registry is unreachable, hand-roll the minimal primitives + `cn` util and say so.

## Checklist

- [x] F1-1 — Install Tailwind CSS v4 (`tailwindcss`, `@tailwindcss/postcss`) in `apps/web`, wire `postcss.config.mjs`, add `@import "tailwindcss"` to globals.css. Verify: build passes.
- [x] F1-2 — Define the gastronomic token scale in `@theme` (shadcn semantic names: background/foreground/primary/secondary/muted/accent/destructive/border/ring/card/input + warm AltaCocina values; keep LUXE vars as legacy block). Verify: build passes, demo page still renders.
- [x] F1-3 — shadcn init (`components.json`) + generate primitives: button, badge, card, input, label, textarea, select, slider, dialog, sheet, dropdown-menu, tabs, separator, skeleton, table, sonner/toast. Verify: files exist, build passes.
- [x] F1-4 — `/design-preview` page rendering palette swatches + key primitives in both light usage and hover states. Verify: dev server responds 200 on `/design-preview`, build passes.
- [x] F1-5 — Work-unit commit(s) recorded in this document with evidence.

## Follow-ups (pending user/domain-layer decision)

- During the Next 16 async-params migration it was discovered that `notifications/[id]/mark-all`, `notifications/[id]/unread-count`, and `reviews/[id]/stats` handlers were originally written against `[userId]` / `[productId]` keys while their URL folders say `[id]` (handlers crashed at runtime with `undefined` params under the old sync-params convention). They ship aligned to the `[id]` segment so the routes compile and work; a later URL-scheme decision (rename folders to `[userId]`/`[productId]` vs keep `[id]`) belongs to the domain-layer owner, not Phase 1.

## Verification evidence

- `npm run build -w apps/web` — exit 0 after the async-params route fix + tailwind v4 wiring (build was failing on the base commit for pre-existing route/app breakage, resolved by fix commit b664bd4). Wiring committed as build(web) 8ccaa4e.
- `npm i -w apps/web tailwindcss@^4 @tailwindcss/postcss@^4 postcss` — completed cleanly (tailwindcss 4.3.3); deps placed in devDependencies.
- Gastronomic tokens build verified — `npm run build -w apps/web` exit 0 with the `@theme inline` semantic scale + legacy LUXE block coexisting. Commit: feat(web) 6e73b9a.
- shadcn generation — `npx shadcn@latest init` wrote `components.json` (style base-nova); `npx shadcn@latest add ...` generated 16 primitives into `apps/web/components/ui`. CLI-spawned npm install was rejected by the machine allow-scripts npm policy; runtime deps (cn, class-variance-authority, tw-animate-css, @base-ui/react, lucide-react, sonner, next-themes) were installed with plain npm instead. `npm run build -w apps/web` and `npm run check-types -w apps/web` both exit 0. Commit: feat(web) c824e4d. Note: this CLI generation imports `cn` from the `cn` npm package, so no `lib/utils.ts` shim exists.
- Dev smoke — `npm run dev -w apps/web` (Next 16.2 Turbopack, port 3000): `GET /design-preview` → 200, `GET /` → 200 (legacy demo intact). Server stopped after check. Commit: feat(web) d7b00df.
- Final battery on the complete Phase 1 tree — `npm i -w apps/web` exit 0, `npm run build -w apps/web` exit 0, `npm run check-types -w apps/web` exit 0, clean working tree. See `git log` below. Commit: docs(tasks) (this document update).

## Route declaration

- Route: delegated direct writer (multi-file, cross-package installs; Writer trigger fires).
- Git/tests/install actions: allowed bounded actions inside the writer payload.
- Post-writer: parent structural readback + one rerunnable check (unassessable RDD tier: native review unavailable — gentle-ai blocked by system policy), then independent verify pass if anything is partial.

## Forecast and delivery

- Forecast: ~300 authored lines of config/token code (UI primitives are generated upstream code, excluded from count). Strategy: `ask-on-risk` (default), slices by work-unit commit. Under 400 lines: no chain needed this phase.

## Acceptance criteria

1. `turbo build --filter=web` exits 0 on the feature branch.
2. Dev server serves `/design-preview` with 200 and the warm palette visible.
3. Demo page renders without console errors (legacy vars intact).
4. Every checked item above has observed evidence in the Verification section.
