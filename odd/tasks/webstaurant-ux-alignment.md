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
- [ ] F7-2 — Header three-row rebuild (utility/search/category bar).
- [ ] F7-3 — Category mega-menu component.
- [ ] F7-4 — Home merchandising rebuild (campaigns, tiles, deals row, quote block).
- [ ] F7-5 — E2E suite green + home smoke test; ticks + evidence.

### Phase 8
- [ ] F8-1 — PLP facets/sort/chips contract use + implementation.
- [ ] F8-2 — PDP related + breadcrumb + layout depth.
- [ ] F8-3 — E2E additions (facet/sort determinism); ticks + evidence.

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
