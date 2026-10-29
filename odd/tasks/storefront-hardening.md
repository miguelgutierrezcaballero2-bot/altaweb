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

- [ ] F6-1 — Styled not-found + error boundaries (global + segments); scroll/web-vitals hints fixed.
- [ ] F6-2 — Metadata/a11y/LCP hygiene pass.
- [ ] F6-3 — Playwright install + config + 3 tests passing against production build.
- [ ] F6-4 — Work-unit commits per slice with evidence; final clean build/typecheck/E2E gates.

## Route declaration

- Delegated direct writer (continuing session). Verification unassessable tier (native review blocked by system policy): writer self-verification + parent spot check + parent browser pass (visual check of 404/error pages + Lighthouse on `/` and `/products`).

## Forecast and delivery

- Forecast: ~450 authored lines (boundaries + config + 3 tests). Strategy: ask-on-risk; commit per slice.

## Acceptance criteria

1. Clean build + check-types exit 0; E2E suite green end-to-end on the machine.
2. `/products/prod_bogus` renders styled not-found (HTTP semantics per Next reality; dev vs prod quirk already documented).
3. Checklist ticks with observed evidence; runner blockers (if any) recorded honestly.
