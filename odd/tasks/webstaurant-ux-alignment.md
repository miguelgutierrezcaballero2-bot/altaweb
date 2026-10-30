# Feature: WebstaurantStore UX Alignment (Fases 7-9)

## Objective

Align the storefront UX with webstaurantstore.com (the B2B restaurant-supply reference) while keeping the warm AltaCocina design system: category mega-menu navigation, merchandising-heavy home, faceted catalog, and B2B quote request.

## Problem

The storefront built in phases 1-6 is clean but shopper-basic: 3-link nav, hero + featured products home, plain listing. The reference model's UX patterns (utility header with prominent search, category mega-men­u, merchandising home with campaign blocks and featured categories, faceted PLP, related products, quote request) are the standard for this vertical.

## Why

User decision (in conversation): use webstaurantstore.com as UX model, full phased series.

### Model analysis (grounded)

Observed on webstaurantstore.com:
- **Header**: utility row (Sign In dropdown with quick links, Returns & Orders, cart with count badge) + prominent search ("What are you looking for?") + horizontal category bar with hover mega-menus.
- **Home = merchandising**: promo campaigns carousel/blocks with coupon codes, featured-category tiles, best-seller rows with rating stars and per-unit prices ($39.99/Case, /Each), trust blocks (Outlet, Sales), Request a Quote CTA for large lists.
- **B2B signals**: per-unit-of-sale pricing, quote request, quick links (track order).

### Domain honesty rules (MANDATORY)

Domain layer (`lib/managers/**`, `lib/types/**`, `app/api/**`) is untouched. Features that the domain does not provide are **not faked**:
- Ratings/reviews, brands, product specs, tiered case pricing do NOT exist in the data model → record as domain follow-ups; UI must not render fake stars/specs/prices.
- Use only existing contracts: categories from categoryManager, promotions (seeded demo promo codes via the established HTTP mirror pattern), products (name-only search — record as follow-up if it limits a UI pattern).

## Scope (per phase)

### Phase 7 — Mega-menu + merchandising home
- Header rebuild in the model's three-row structure: utility row (account/user menu, orders link, cart with count) / prominent search row / category bar row.
- Category mega-menu component (desktop hover panel, mobile accordion) populated from the real category contract.
- Home merchandising rebuild: promo campaign block(s) fed by seeded promotions (real codes), featured-category tiles, featured/deals product row, Request-a-Quote B2B block (static section, CTA navigates to a quote anchor/section in phase 9), trust strip.
- Existing Playwright suite must stay green (no broken money-flow selectors).

### Phase 8 — Faceted catalog + product detail depth
- PLP faceted sidebar (category, price bands, availability if contract offers it), sort control (price asc/desc, newest if contract offers), results count, active-filter chips, list/grid toggle.
- PDP: related items by category, breadcrumb, richer layout (gallery of available renders/images; specs table only if data exists — else honest placeholder + follow-up).
- Search UX upgrade within contract limits (name-only documented).

### Phase 9 — Quote request + polish
- Quote-request surface (business info form, no backend contract → gray-out honest notice or server action storing nothing / demo behavior recorded as follow-up; decide honestly, never fake a submit success that lies).
- Catalog/checkout polish pass on model patterns (sticky add-to-cart, per-unit price display if semantics exist).
- Final full-gate run + Lighthouse sanity.

## Constraints

- `lib/managers/**`, `lib/types/**`, `app/api/**`, `components/ui/**` untouched; tokens in `globals.css` untouched (reuse token scale).
- es-ar copy, English identifiers, conventional commits, no push/PRs.
- Do not break phases 1-6 flows: gating, checkout, orders, 404/error boundaries.
- Playwright suite stays green; add suite coverage per phase.
- Never commit red runs.

## Checklist

### Phase 7
- [x] F7-1 — Read category/promo/header/home contracts; document shapes + limits in this doc.
- [x] F7-2 — Header three-row rebuild (utility/search/category bar).
- [x] F7-3 — Category mega-menu component.
- [x] F7-4 — Home merchandising rebuild (campaigns, tiles, deals row, quote block).
- [x] F7-5 — E2E suite green + home smoke test; ticks + evidence.

### Phase 8
- [x] F8-1 — PLP facets/sort/chips contract use + implementation.
- [x] F8-2 — PDP related + breadcrumb + layout depth.
- [x] F8-3 — E2E additions (facet/sort determinism); ticks + evidence.

### Phase 9
- [ ] F9-1 — Quote-request surface (honest demo behavior).
- [ ] F9-2 — Polish pass (sticky add-to-cart, per-unit semantics if real).
- [ ] F9-3 — Final gates + evidence ticks.

## Route declaration

- Delegated direct writer (continuing session ses_e79df12f3ffeQyFdExXZI6GYmh), one phase at a time; parent re-verifies every phase (trust-but-verify: build/check-types/E2E observed + browser pass).

## Forecast and delivery

- Forecast (full series): ~1,600-2,000 authored lines across 9 task units. Exceeds ~400 → strategy `ask-on-risk` with cached continuation: per-slice work-unit commits on `feat/frontend-foundation` (same mode as phases 1-6). Push/PR still a pending user decision from phase 6.

## Acceptance criteria

1. Per phase: clean build + check-types exit 0; Playwright suite green (observed by parent).
2. No faked domain features; follow-ups recorded honestly.
3. Phases 1-6 flows unbroken (E2E proves it).
4. Checklist ticks with observed evidence.

## F7-1 evidence — contract discovery (read from source, Fase 7)

### Category contract (`lib/types/category.ts` + `category-manager.ts`)

- `Category { id, name, slug, description, parentId: string | null, image: string | null, sortOrder, isActive }` + `CategoryNode.children` via `CategoryManager.getTree()`.
- Manager surface: `findAll`, `findBySlug`, `findByParent`, `getTree` — no search/subcategory helpers.
- **Seeded reality: 3 root categories only** (`pollerias`, `cafeterias`, `pizzerias`, all `parentId: null`, `image: null`, rich es-ar `description`). The contract supports subcategories structurally, but none exist in the data → **no fake taxonomy**: the mega-menu panel per category shows the real description + supporting links built from REAL data (the category's actual products via `productManager.findByCategory`, top-rated). Category tiles are token-styled (no `image` in data; no asset downloads).
- Follow-up recorded (F8/9): richer taxonomy (parent/child categories) is a domain extension, not Phase-7 UI.

### Promotion contract (`lib/types/promotion.ts`) + seeded campaigns

- `Promotion { code, discountType, discountValue: number, minPurchase: number | null, maxUses, usesCount, validFrom, validUntil, isActive, applicableCategories }`.
- Seeded promo codes off the seed module (`DEMO_PROMOTION_INPUTS`): **`BIENVENIDA10`** (percentage, 10, min purchase $100.000) and **`GASTRO20K`** (fixed, $20.000, min purchase $800.000). These two (and only these) are real; campaign blocks render them with honest copy derived from `discountType`/`minPurchase`, filtered by `isActive` + `validUntil > now`.
- Graph note: home page reads the promotion manager within its own render graph after `ensureCatalogSeeded()` — no cross-graph read, so no HTTP mirror needed on home (mirrors exist for the API graph from Phase 4/5 work).

### Header + home component inventory (pre-rebuild)

- `header.tsx` (single row today): brand link, native GET search form (`action="/products"`, `name="search"` — the `?search=` contract), nav with Inicio + category links, `UserMenu` (session dropdown, Base UI Menu; DropdownMenuGroup fix `2ef3a75` respected), `CartButton` (count badge from the shared zustand cart store, aria-label `Abrir carrito, <n> unidades`). All behaviors to preserve.
- `page.tsx` (home today): hero band + `VERTICALS` cards + Destacados grid (`productManager.getFeatured()` sorted rating desc/price asc, cap 4) + trust strip (flete/garantía/uso intensivo).
- Footer copy for the trust strip: `ventas@altacocina.com`, `Lun a Vie 9–18 h`, `Cotizaciones B2B por rubro`, flete e instalación.
- Playwright dependency scan: money-flow/gating specs use the login page heading, form-scoped `Iniciar sesión` submit, user-menu button name, drawer + checkout ids `#businessName`…`#zip`, `Validar`/`Confirmar pedido` texts — none touch the header search/nav markup; the rebuild keeps `?search=` + `?category=` query contracts unchanged, so no test edits expected.
- Quote block honesty: no quote-route exists in phases 1-9-up-to-now → Phase 7 renders a teaser section (`#cotizacion`) with real contact chips (`ventas@altacocina.com` mailto CTA) and an explicit "formulario en preparación" note; no dead `/quote` route.

## F7-2..F7-5 verification evidence (observed results)

Commits in order: `0c50913` (F7-1 doc) → `aaa8a31` (mega-menu component) → `2fbea09` (three-row header) → `c7d3594` (merchandising home) → `fb63f47` (money-flow test scope fix) → this doc.

Clean gates (final, after all slices including the prod-build E2E runs, from repo root):

- `npm run build -w apps/web`: exit 0 (`BUILD_EXIT=0`).
- `npm run check-types -w apps/web`: exit 0 (`TYPECHECK_EXIT=0`).
- `npm run e2e -w apps/web`: **5 passed** (45.1s) on msedge against the production build (port 3100): 3 gating + money flow + styled not-found. One run failed before the fix (honest record): 4 passed / money-flow strict-mode failure — see below.

Test-locator impact (declared, per the same-commit rule):

- The header mega-menu renders every rubro panel SSR page-wide, so money-flow's page-wide `getByText(/Freidora/)` on the order confirmation resolved to 3 elements (panel description + panel product link + order item) and tripped strict mode (first run: 4 passed / 1 failed — not committed on red). Fixed by scoping to `getByRole('main')`; no production behavior relaxed. Commit `fb63f47` states the change.

Dev smoke (observed, dev on port 3001 — see port note):

- Header three rows render: utility band with flete copy + `Mis pedidos` + user menu + `Abrir carrito` trigger; prominent search field; category bar with real seeded rubros (`Pollerías`/`Cafeterías`/`Pizzerías`) and per-rubro panels showing the real descriptions plus the category's top-rated products (`Equipos del rubro` panels observed on every page).
- Home merchandising: seeded promo codes `BIENVENIDA10` and `GASTRO20K` render with honest copy (`10% de descuento`, `compras desde …`, `Ingresá el código al confirmar tu pedido`); `#cotizacion` anchor present with the `fase 9` form-in-progress note and mailto CTA; Destacados row renders the featured grid (price `1.845.000` card among them).
- Contracts intact: `/products?search=freidora` returns the searched cards; `/products?category=cafeterias` returns the cafeterías grid.
- Promotion filtering uses `promotionManager.getActivePromotions()` (isActive + validity window), sorted deterministically by code — no fake promos, no invented discount semantics.

Port note (honest): dev-on-3000 hit transient `EADDRINUSE` (Twice) while `Get-NetTCPConnection` and netstat showed no listener; my curls succeeded — i.e., an environment-level proxy endpoint held 3000 outside of this session's process visibility. Smoke therefore ran on dev port 3001 (CLI override only; no config or script change). At teardown, the Win32_Process ownership filter also found and killed a stale `next dev --port 3000` process-tree node (PID 13024) — permitted target per the ownership rule (node.exe + AltaCocina/next cmdline; ttyd/codegraph untouched). Final state: ports 3000/3001/3100 all FREE per `Get-NetTCPConnection`.

Domain honesty audit (F7): ratings/brands/specs/subcategories/tiered pricing — none invented; the mega-menu shows real descriptions + real products (cap 6, top-rated, isActive-filtered) instead of fake subcategory trees; campaign copy derives strictly from `discountType`/`minPurchase`; category tiles map slugs to icons because the contract carries no image data (fallback icon for future slugs).

Follow-ups (recorded, not phase-7 scope): real subcategory taxonomy is a domain extension (F8/9); web quote form is fase 9 by design; `.gitignore` for `test-results/` pending (phase-6 recorded follow-up).

## F8-1..F8-3 verification evidence (observed results, Fase 8)

Commits in order: `678ec6f` (faceted PLP) → `8537885` (PDP depth) → `d4f0664` (price-band chip fix) → `d83a95f` (facets E2E) → this doc.

### Contract re-verification (F8-1 discovery)

- `Product { price, compareAtPrice, images, stock, rating, createdAt, updatedAt, isActive, sku }` — so **availability facet is contract-supported** (`stock`) and **sorts are real contract fields**: `price` (asc/desc), `rating`, `novedad` (`createdAt`, tie-break `sku` for the near-identical seed timestamps). Default `relevancia` preserves the stable seed listing order (`toSorted` is stable).
- `productManager` surface: `findAll`, `findByCategory`, `searchByName` (name-only), `getFeatured` — no price/sort helpers; the page applies URL-driven filters/sorts **server-side during RSC render** (real URL semantics, not client state). Recorded follow-up: **the `/api/products` GET route exposes only `search`/`categoryId` — a sort/price-params extension would be an API-surface change (out of allowed surface), documented here honestly.**
- `/api/products` re-checked: GET params `search`, `categoryId` only. `/api` untouched per surface rules.

### URL grammar (documented contract)

```
/products
  ?category=<slug>    rubro facet (pollerias | cafeterias | pizzerias)  [existing]
  ?search=<text>      name-only search                                  [existing]
  ?min=&max=          price-band bounds in ARS (numeric, >0, validated)
  ?stock=in           availability facet — stock > 0
  ?sort=              relevancia (default) | price-asc | price-desc | rating | novedad
```

Fixed UI bands over the real seeded range (labeled "franjas aprox."): hasta $500.000 (`max=500000`), $500.000 a $1.500.000 (`min=500000&max=1500000`), más de $1.500.000 (`min=1500000`). Facet counts aggregate over the set filtered by every OTHER facet (standard faceting semantics, honest counts). Chips are real `<Link>`s dropping exactly one param; clear-all → `/products`. Sort control is a native GET form carrying over the remaining filters.

### PDP depth (F8-2)

- Breadcrumb `Inicio / Rubro / Equipo` (real links, replaces the back link).
- Related row: same rubro, `isActive`, excluding self, sorted rating desc → price asc → id, cap 4, `ProductCard` reuse.
- Info panel adds a real availability badge (`En stock` / `Agotado` straight from `stock`); main image is larger (aspect 4/3 mobile, square desktop) with `priority` loading.
- **Specs/attributes table NOT rendered — the Product contract carries none. Honest follow-up: a specs model is a domain extension for a future phase.** No fake per-unit semantics; copy unchanged.

### Gates + E2E (observed)

- `npm run build -w apps/web`: exit 0. `npm run check-types -w apps/web`: exit 0 (final, after E2E).
- `npm run e2e -w apps/web`: **12 passed (39.8s)** — 5 prior + 7 new facets/PDP tests. Honest red-run record: first run 10 passed / 2 failed — (1) price-band removal chip never rendered for single-bound bands (page bug: chip condition demanded both min and max defined; fixed in `d4f0664`), (2) empty-state "Limpiar filtros" resolved 2 elements (chips-row clear-all + empty-state CTA; test scoped to `section`). No money-flow locator changed; no config change.
- Dev smoke (port 3001): facet sidebar/group rendering, band `min=1500000` → chip + band-filtered cards, `sort=price-asc` first card = $89.000 (Palas de horno), `sort=price-desc&category=cafeterias` first card = $4.650.000 espresso with the category carried, PDP breadcrumb + `Tambi`n te puede interesar` (pizzer`as rubro) + `En stock` badge, anonymous `/checkout` still streams the login redirect. Raw-HTML "missing" strings traced to RSC `<!-- -->` text-node separators (dev artifact), not absent content.
- Ports 3000/3001/3100 free at handback; zombie scan clean (one more stale `next dev --port 3000` tree was caught and killed by the ownership filter at teardown).

### Domain honesty audit (F8)

- No fake server-side semantics: sorts/filters run on the manager reads in the RSC page from real URL params; the API-route gap is recorded, not papered over.
- Availability facet/backed by the real `stock` field; no invented "envío en 24h"-style copy.
- Price bands are UI grouping over real prices with the "franjas aprox." honesty hint; no per-unit-of-sale pricing invented (does not exist in the contract).
