# Feature: Accounts & Vendor Role (Fase 5)

## Objective

Session-based accounts with a vendor (sales-only) role: login/logout, session-aware header, and gated checkout + orders surfaces, per the confirmed business model (vendedores con acceso solo a ventas).

## Problem

Checkout uses a seeded demo user silently; there is no identity, no logout, no role distinction — anyone can sell.

## Why

Approved plan (Phase 5); user decision from discovery: vendors get system access restricted to sales functions.

## Scope

In scope:
- `/login` page (client form, es-ar copy) calling the users/auth HTTP contract; session stored in an httpOnly cookie (opaque token + userId + role claim).
- `lib/auth/session.ts`: cookie helpers (get/set/clear via `next/headers`), `getCurrentUser()` reading the users data back through the HTTP contract (cross-graph safe per Phase 4 lesson).
- Header user area: login link when anonymous; user dropdown (name, role badge, Cerrar sesión) when logged in.
- Gating: `/checkout` shell + orders pages require an active session (redirect to `/login?next=...`); checkout allowed for any authenticated vendor/admin-role user (sales function).
- `/orders` list: authenticated vendor/admin sees recent orders via the orders HTTP contract (their own in Phase-4 semantics; admin sees all).
- Logout: server action or contract route per what auth offers.
- Seed: second demo user with the non-admin role closest to "vendor" per the real role enum in `lib/types/user.ts`; if no vendor-like role exists, use the closest role, label the UI honestly, and record the domain follow-up (role enum extension = domain owner).

Out of scope: registration, password reset, forgot-password, JWT/OAuth, admin CRUD of products (users-admin belongs to a later phase), notification-driven UI.

## Constraints

- `lib/managers/**`, `lib/types/**`, `app/api/**` untouched. Consume auth/users/orders contracts exactly as they exist.
- Cookie must be httpOnly + sameSite=lax; do not store passwords client-side; demo-seeded passwords stay as documented demo credentials on the login page hint.
- Do not break prior flows: `/products`, `/products/[id]`, `/design-preview`, and logged-out browsing must stay reachable; only checkout/orders are gated.
- Spanish-first UI copy, English identifiers.

## Checklist

- [x] F5-1 — Read users/auth/orders contracts; document shapes + role enum findings in the doc.
- [x] F5-2 — Session helpers + `/login` + logout + header user area.
- [x] F5-3 — Gate `/checkout` + `/orders` + `/orders/[id]`; seed the second demo user.
- [x] F5-4 — `/orders` list page.
- [x] F5-5 — Work-unit commits per slice with evidence ticks.

## HTTP contract shapes (F5-1 evidence — read from `app/api/users/**` + `lib/managers/user-manager.ts`)

### Users

- `GET /api/users` → 200 `{ users: [...] }` (all, password stripped); `GET ?email=<email>` → 200 `{ user }` / 404 `{ "error": "User not found" }` — **this is the only email→id resolver** (no login-by-email route exists).
- `POST /api/users` → 201 `{ user }` (CreateUserInput: email, password — stored plaintext in demo —, firstName, lastName, phone?, address?, role?, isActive?) / 400.
- `GET /api/users/[id]` → 200 `{ user }` (sans password) / 404; `PUT` update; `DELETE` delete.

### Auth — `POST /api/users/[id]/auth` (id-keyed)

- Body = `AuthenticateUserInput` `{ email, password }`.
- 200 → `{ "result": { "user": {...user sans password}, "token": "token_<userId>_<ts>" } }`; 401 → `{ "error": "Invalid credentials" }`; 400 `{ "error": "Authentication failed" }`.
- Route detail verified in source: `userManager.authenticate()` is **keyed by the email in the body, not the id path segment** — the id is only used for the `lastLogin` update record. The correct client flow is therefore: `GET /api/users?email=` → resolve id → `POST /api/users/<id>/auth`.
- No logout/sessions routes exist — logout is cookie clearing on the app side.
- `user.lastLogin` is mutated directly on the manager object (aliased mutation, not a fresh Map set) — dev-HMR caution noted, no action needed from this phase.

### Role enum ground truth (`lib/types/user.ts`)

`UserRole = 'customer' | 'admin'`. **No vendor/sales role exists.** Per the honest-read rule, the enum is NOT extended: the second demo user (vendedor persona) is seeded with `'customer'` — the closest non-admin role — and the UI labels it "Cliente" with an explicit note that the vendor role is pending in the domain. Domain follow-up recorded below.

### Phase-4 lesson applied to auth

Dev Turbopack keeps three isolated module graphs (boot / pages / api routes), so the seeded demo users are invisible to the users API in dev. The `/login` shell mirrors them into the API graph through the users HTTP contract (`syncDemoUsersViaApi`: `GET ?email=` → 404 ⇒ `POST /api/users` with the documented demo credentials), mirroring the Phase-4 `syncDemoPromotionsViaApi` pattern. Session cookies carry user ids from the API graph; a server-restart id drift is caught by server-side verification (`GET /api/users/<id>` → 404 ⇒ treated as signed out).

### Session trust model (as implemented, honest)

Cookie `altec_session`: httpOnly, sameSite=lax, path=/, 7-day expiry; value = base64url JSON `{ token (crypto.randomUUID, unguessable), userId, email, fullName, role }`. Display claims (name/role) are read from the payload without network I/O; when identity matters (gated routes), the userId is verified against the users contract server-side. The payload is **not signed** — a user could forge a cookie and pass contract verification only if the referenced account exists (forged id must resolve), forgery of role alone never gates anything (all roles can sell; admin shows extra data). Signing/HMAC or server-state sessions are the follow-up for Phase 6+.

## Route declaration

- Delegated direct writer (continuing session). Verification unassessable tier: writer self-verification + parent spot check + parent browser E2E pass (login as vendor → checkout → confirmation → logout).

## Forecast and delivery

- Forecast: ~600 authored lines (login page, session lib, header user area, orders list, gating). Strategy: ask-on-risk; commit per slice.

## Acceptance criteria

1. Build + check-types exit 0 from clean.
2. Browser E2E: anonymous checkout redirect → login with demo credentials → checkout completes → confirmation shows identity/role; logout works; wrong password shows visible error.
3. Checklist ticks with observed evidence; role-enum follow-up recorded honestly if applicable.

## F5-5 verification evidence (observed results, dev on port 3000)

Commits in order: `fa2099b` (contracts doc) → `d42e61e` (session + login + header user area) → `811a510` (fix: actions lifted out of client files) → `f55ed21` (gating) → `aa97c75` (orders list) → this doc.

Clean gates (final, after all slices, from repo root):

- `npm run build -w apps/web`: exit 0 (`BUILD_EXIT=0`).
- `npm run check-types -w apps/web`: exit 0 (`TYPECHECK_EXIT=0`).

Contract-level auth smoke (single self-contained shell per run; the auth route lives in the API graph against users mirrored by `syncDemoUsersViaApi` — dev log: `GET /api/users?email=…` 404 → `POST /api/users` 201 per account, then 200/200):

- `POST /api/users/<id>/auth` wrong password → **401** (`Invalid credentials` path — client maps it to the visible error).
- Same call with the demo password → **200** `{ result: { user (sans password), token: token_usr_… } }`; `user.id` matches the resolved account; no `password` field in the payload.
- Vendor persona authenticates → **200**, `vendedor@negocio.demo`, role `customer` (closest available, follow-up recorded).

Page-level smoke (curl.exe with `--max-redirs 0`; PowerShell 5.1 silently drops a `Cookie` header passed via `-Headers`, which is why a first script-based run misread every authed probe as anonymous):

- Anonymous `/checkout`, `/orders`, `/orders/[id]` → dev streams HTTP 200 whose flight payload carries the actual redirect instruction (`NEXT_REDIRECT` + `login?next=%2Fcheckout` / `%2Forders`), the same dev-streaming behavior already proven for `notFound()`. No top-level 307 appears at the socket level in dev; curl proof of the payload markers.
- Authed probes (hand-built `altec_session` claims cookie, same shape `encodeSessionCookie` writes): `/checkout` → 200 showing the session identity ("Vendido a nombre"); `/orders` → 200 listing the mocked order (`ord_…` id present, admin sees all orders via `GET /api/orders`); `/orders/[id]` → 200 showing the confirmation state and the exact order id from `POST /api/orders` (201).
- Server-side verification happened for every authed gated render — dev log shows `GET /api/users/<userId>` 200 immediately before each gated page render, and `GET /api/orders` for the list.
- Garbage (undecodable) cookie on `/orders` → redirect instruction to login, no verification fetch. Well-formed claims with a nonexistent userId (stale id) → `GET /api/users/usr_stale_missing` 404 in dev log → redirect instruction to login. Trust model behaves as documented.
- `/products` and `/design-preview` anonymous → 200 (browse surfaces intentionally ungated).
- `POST /api/orders` attributed to the session userId (contract-visible in the created order).

Cleanup: dev server tree killed (PIDs 7300/9796/9196/22044), `Get-NetTCPConnection -LocalPort 3000 -State Listen` empty → **port 3000 free**. `git status` clean after this docs commit.
