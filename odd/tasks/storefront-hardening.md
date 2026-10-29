# Feature: Storefront Hardening (Fase 6)

## Objective

Make the storefront production-honest: global error/not-found UX, a11y + metadata hygiene, and an automated Playwright E2E suite covering the money flow, so regressions are caught without hand-smoking every session.

## Problem

Five phases shipped green, verified only by hand-smokes and parent browser passes: one wrong click can crash a page (Phase 5 proved it), there is no styled 404/500, no error boundaries, and no automated regression net.

## Why

Approved plan (Phase 6); the storefront's last functional phase closes with automated verification.

## Scope

In scope:
- Global `app/not-found.tsx` + `app/error.tsx` (storefront-styled, warm tokens; reset/retry CTAs; es-ar copy). Segment-level `error.tsx` for products/checkout/orders routes.
- `data-scroll-behavior="smooth"` on `<html>` (Next 16 smooth-scroll route-transition hint from dev logs); route `metadata` (title template + descriptions) for home/products/orders/login; missing alt treatments audited.
- LCP hygiene: `loading="eager"` on above-the-fold card images (dev-log suggestion from prior phases).
- Playwright E2E suite (`apps/web/e2e/**` + `playwright.config.ts`): against the production build (`next start`), using system Edge/Chrome channel to avoid browser downloads (npm policy blocks browser-download scripts; if that fails, attempt explicit chromium install and report). Tests: (1) anonymous gating redirect and login flow with wrong-password error then success, (2) the money flow: seeded product → add to cart → checkout with promo `BIENVENIDA10` → order created → confirmation page content → logout, (3) `/products/prod_bogus` shows the styled not-found.
- npm scripts: `e2e` (run against a port aliased away from 3000).

Out of scope: unit-test framework, CI pipeline wiring, real payment/messaging, image pipeline optimization, signup.

## Constraints

- No PRs, no push, no server-type changes. Do not weaken auth behavior to make tests pass.
- Keep `PORT 3000` semantics untouched (tests target another local port via env).
- Windows quirks accepted (session learnings: PowerShell cookie quirks, Turbopack graphs). If the E2E runner cannot run to pass on this machine, attempt minimal fallback (single happy-path test) and record what blocked; never commit a red run.
- Domain layer remains untouched.

## Checklist

- [x] F6-1 — Styled not-found + error boundaries (global + segments); scroll/web-vitals hints fixed.
- [x] F6-2 — Metadata/a11y/LCP hygiene pass.
- [x] F6-3 — Playwright install + config + 3 tests passing against production build.
- [x] F6-4 — Work-unit commits per slice with evidence; final clean build/typecheck/E2E gates.

## Route declaration

- Delegated direct writer (continuing session). Verification unassessable tier (native review blocked by system policy): writer self-verification + parent spot check + parent browser pass (visual check of 404/error pages + Lighthouse on `/` and `/products`).

## Forecast and delivery

- Forecast: ~450 authored lines (boundaries + config + 3 tests). Strategy: ask-on-risk; commit per slice.

## Acceptance criteria

1. Clean build + check-types exit 0; E2E suite green end-to-end on the machine.
2. `/products/prod_bogus` renders styled not-found (HTTP semantics per Next reality; dev vs prod quirk already documented).
3. Checklist ticks with observed evidence; runner blockers (if any) recorded honestly.

## F6-4 verification evidence (observed results)

Commits in order: `bdddc02` (doc tracked) → `e212cb5` (not-found + error boundaries) → `2e5677b` (metadata template + scroll hint + LCP-eager) → `5295c83` (playwright suite) → this doc.

Clean gates (final, after all slices including the prod-build E2E runs, from repo root):

- `npm run build -w apps/web`: exit 0 (`BUILD_EXIT=0`).
- `npm run check-types -w apps/web`: exit 0 (`TYPECHECK_EXIT=0`).
- `npx playwright test` via `npm run e2e` (cwd apps/web, msedge channel, production build web server on 3100): **5 passed** (32.0s): 3 gating + 1 money flow + 1 not-found. Never committed a red run: every failure was fixed before commit.

Production-build manual smoke (port 3100, before writing tests):

- `/`, `/products`, `/login` → 200. Anonymous `/checkout` → HTTP 200 whose streamed document carries the login redirect (`NEXT_REDIRECT` + `login?next=%2Fcheckout`). `/products/prod_bogus` → HTTP 200 with the styled 404 UI markers in the body (`no existe`, `Volver al inicio`, `Ver catálogo`).
- Reality recorded (constraints correction): Next 16.2 streams these responses in the production build too, so dev/quirk and prod quirk match — tests assert UI/URL content, not raw 404/307 statuses.
- Seed-at-read works on `next start` (single process per page graph, route-bundle separate module instances): `/login` render seeds users + mirrors via HTTP (200 lookups), authed `/checkout` render mirrors `BIENVENIDA10`; correcting a smoke assumption, the API product graph stays empty in prod (no product mirror and none needed — orders POST carries items in the body).
- Geography: route-bundle module isolation holds in production too — `syncDemoUsersViaApi`/`syncDemoPromotionsViaApi` are load-bearing in prod as well.

Test-determinism findings (fixed before commit, honest list):

- Filter-by-text on `div` matched ancestor wrappers (strict-mode: 14 buttons); fixed by scoping to `[data-slot="card"]` + SKU text.
- `Button render={<Link>}` keeps **button** role (gating proves it); link-role locators rewritten to buttons.
- Cart `addItem` auto-opens the drawer and the modal sheet aria-hides the page, so the flow asserts on the open dialog and clicks onward from it.
- es-AR money renders a **non-breaking space** in `$ 1.845.000` — price assertions match digits, not literals.
- `next/image` cards: images already had `alt = product.name`; the LCP fix was `loading="eager"` only.

Cleanup and handback: smoke servers killed by PID ownership inspection (node.exe with next/npm-cli cmdline only; ttyd/codegraph untouched); `Get-NetTCPConnection` for 3000 and **3100 both free** at handback. `git status` clean.

Runner notes: `msedge` and `chrome` system channels both exist on this machine; `msedge` used. Browser-download steps skipped (`PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`, npm policy). Follow-up (out-of-surface note): add `apps/web/test-results/` + transient run logs to `.gitignore` — they were manual-cleaned before handback.
