# Feature: Storefront Shell (Fase 2)

## Objective

Replace the Turborepo demo with the store shell: gastronomic-branded layout (header with search + nav, cart drawer, footer) and a warm-token home placeholder, so Phase 3's catalog lands on real scaffolding.

## Problem

Phase 1 gave the branch a design system and primitives, but every page still renders the create-turbo demo; there is no store navigation, no cart state, no branded chrome.

## Why

Approved 6-phase plan (Phase 2 = shell). B2B vendors need daily-usable chrome: persistent search, categories nav, quick cart access.

## Scope

In scope:
- `apps/web/app/layout.tsx`: Header + Footer wire-in.
- Header: AltaCocina branding (logo text + icon), search form (GET → `/products?search=`), category links from `CategoryManager` via RSC, cart button opening the drawer.
- Cart drawer (shadcn sheet) driven by a `zustand` cart store (`lib/store/cart-store.ts`): open/close, line items, qty +/-, remove, subtotal; empty state.
- Temporary home page: warm hero placeholder ("AltaCocina — equipamiento gastronómico B2B") + link to `/design-preview`. Catalog home is Phase 3.
- Delete `page.module.css`; remove the legacy LUXE token block from globals.css.
- Add `zustand` dependency.

Out of scope: full catalog pages, product grid (Phase 3), real cart API sync, promo/shipping logic (Phase 4).

## Constraints

- Keep all 10 API domains and managers untouched.
- RSC-first: header categories must use server component data; the drawer is the only heavy client island (plus its store).
- Keep `/design-preview` working.
- Spanish-first UI copy for the storefront (es-ar business), English code identifiers/comments per repo convention.

## Checklist
- [x] F2-1 — Install `zustand`; create cart store; remove legacy LUXE tokens + demo CSS module. Verify: build green.
- [x] F2-2 — Header (brand, search, categories nav via RSC, cart trigger) + Footer; wire into root layout. Verify: build green.
- [x] F2-3 — Cart drawer with zustand store wired to header trigger. Verify: build green.
- [x] F2-4 — Temporary home page replacing demo. Verify: build green.
- [x] F2-5 — Work-unit commit(s) with evidence lines; demo page fully gone from tree.

## Route declaration

- Delegated direct writer via `subagent` (continuing session with full Phase-1 context). Verification: parent spot-check re-run + browser visual check (native gentle-ai review blocked by policy; unassessable tier).

## Forecast and delivery

- Forecast: ~450 authored lines (layout components + store + hero). Strategy: ask-on-risk, one commit per slice, no chaining needed (no PR yet).

## Acceptance criteria

1. Build + check-types exit 0; dev smoke: `/` renders branded shell, cart drawer opens, search form present.
2. Turborepo demo and legacy tokens removed; `design-preview` still 200.
3. Checklist items ticked with observed evidence in the feature doc.

## Verification evidence

- `npm i -w apps/web zustand` — completed cleanly (zustand 5.0.16), plain npm per the allow-scripts policy. Deliberate deviation: zustand placed in `dependencies` (not devDependencies) because it ships in client bundles, unlike the Phase-1 build tooling. Commit: feat(web) 48e4caa.
- `lib/store/cart-store.ts` — items (productId/name/price/image/qty), isOpen drawer state, add/increment/decrement/remove/clear actions, `selectSubtotal`/`selectTotalUnits` selectors. Legacy LUXE token block and dark color-scheme override removed; `body` switched to `var(--background)`/`var(--foreground)`; demo-only animation keyframes removed together with the css module in the F2-4 slice (kept until then so each commit stays green). Build exit 0. Commit: feat(web) 48e4caa.
- Header/footer — header reads `categoryManager.findAll()` in RSC (server component); the in-memory store starts empty so the nav renders the three storefront verticals as fallback links (marked with a comment); native GET search form posts `search` to `/products`; wired into root layout with es-ar metadata. Build exit 0. Commit: feat(web) 7730d19.
- Cart drawer — sheet primitive driven by the cart store: qty +/- rows, remove, empty state "Tu carrito está vacío", ARS/es-AR subtotal, "Continuar compra" CTA (placeholder /products), clear-cart action; header cart icon button with unit-count badge; drawer mounted in root layout. Build + check-types exit 0. Commit: feat(web) d9017df.
- Home page — full demo replacement: warm hero ("Equipamiento gastronómico para tu negocio"), vertical cards, trust strip; `page.module.css` deleted via `git rm`. Build + check-types exit 0. Commit: feat(web) dd38967.
- Final battery — `npm run build -w apps/web` exit 0; `npm run check-types -w apps/web` exit 0; dev smoke: a dev server instance not owned by this session was already bound to :3000 (EADDRINUSE on own start) and served the current working tree, so checks ran against it: `GET /` → 200 containing "Equipamiento", "AltaCocina", search input and drawer trigger markup; `GET /design-preview` → 200. The foreign instance was left running (kill discipline: not this session's process); see follow-up note for the orchestrator.

## Follow-ups (need orchestrator/user attention)

- A dev server not started by this session is bound to port 3000 (tree: `next dev --port 3000`, PID 20888 under cmd 16588, plus start-server and postcss watcher). It serves the current committed tree and was used for the smoke evidence above; stop it if it was not intentionally kept for the parent visual check, otherwise it will shadow future smoke runs with EADDRINUSE.
