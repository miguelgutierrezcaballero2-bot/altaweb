# Feature: Storefront Catalog (Fase 3)

## Objective

Catalog browsing for AltaCocina B2B: `/products` listing with rubro filtering and search, product detail pages, seeded demo catalog, home with featured products, and add-to-cart wiring from cards.

## Problem

The shell CTAs/nav point to a nonexistent `/products`; the managers hold zero data; nothing can be browsed or added to the cart.

## Why

Approved 6-phase plan (Phase 3 = catalog); discovery says B2B buyers need technical specs and fast filtering by vertical (pollerías/cafeterías/pizzerías).

## Scope

In scope:
- `/products` listing (RSC): reads `ProductManager` + `CategoryManager` directly, filter by `?category=` (rubro) and `?search=` (matches header form contract `search` + `category` params), results grid of product cards with count header.
- `/products/[id]` detail (RSC): gallery-less single Image, name/price/compareAtPrice/sku/stock/rating/category link/description full, add-to-cart control; `notFound()` when missing.
- Loading skeletons (loading.tsx streaming) for both routes.
- Seed data: `lib/seed/catalog-seed.ts` + `instrumentation.ts` one-shot seeding (idempotent): the 3 rubro categories matching header nav hrefs plus ~12-18 products spread across rubros (replaces the assorted public/products images as placeholders — keep using those images files).
- Home `page.tsx`: "Destacados" section fed by manager data (featured = top rated or first seeded).
- Product card client CTA "Agregar" wired to zustand cart store (drawer updates, badge count).
- Header nav hrefs aligned to the query contract of the new listing.

Out of scope: pagination beyond a simple count (follow-up note), real persistence, cart API sync/promotions/shipping (Phase 4), vendor accounts (Phase 5).

## Constraints

- Domain managers/types stay untouched EXCEPT no edits at all are planned — if a `Product.specs`-like field is missing, display the fields the type actually has and record the follow-up for fichas técnicas instead of editing domain types.
- Do not break `/design-preview` (must stay 200) or the shell contract: header query params must match listing filter params exactly.
- RSC-first: listing/detail/home are server components; only the product-card CTA is a client island.
- Spanish-first UI copy; English identifiers.

## Checklist

- [x] F3-1 — Seed data + `instrumentation.ts` one-shot seeding (idempotent), categories match nav slugs.
- [x] F3-2 — Header nav hrefs aligned to `?category=` slugs.
- [x] F3-3 — `/products` listing + loading skeleton + product card + client "Agregar".
- [x] F3-4 — `/products/[id]` detail + loading skeleton + 404.
- [ ] F3-5 — Home "Destacados" section.
- [ ] F3-6 — Work-unit commits per slice with doc evidence ticks.

## Verification evidence

- `npm i` — no new packages needed this phase (zustand existed; no runtime additions). Seed verified mentally against the real contracts: `CategoryManager.create({ name, slug, description, sortOrder, isActive })` and `ProductManager.create(CreateProductInput)` from `lib/types/product.ts` (no `specs` field exists — descriptions carry the tech data; see follow-ups).
- F3-1 — `lib/seed/catalog-seed.ts` (3 categories with slugs pollerias/cafeterias/pizzerias + 15 products with SKU, ARS prices, stock/rating spread including one stock=0 item and one stock=2 item) + `apps/web/instrumentation.ts` `register()` calling `seedCatalog()` (idempotent: skips when any manager already holds rows). `npm run build -w apps/web` exit 0, `check-types` exit 0. Commit: feat(web) c02760c. Placeholder images reuse the starter demo JPGs in `public/products/*` (backpack/headphones/etc. are electronics stand-ins — real gastro imagery is a Phase-6 content task).
- F3-2 — Verified no-change: the Phase-2 header fallback hrefs already point to `/products?category=pollerias|cafeterias|pizzerias`, exactly the canonical slugs; seeded categories regenerate identical hrefs from `findBySlug`. Evidence folded into the F3-3 commit header.
- F3-3 — `/products` RSC listing with `await searchParams` (Next 16 Promise style), `?category=` slug filter + `?search=` case-insensitive name match, category chips, count header ("N equipos"), unknown-category and no-match empty states, `loading.tsx` skeleton grid, `ProductCard` server component (next/image aspect-[4/3] placeholder, discount badge when compareAtPrice, es-AR rating display, SKU line, Agotado / Últimas N unidades stock signals) and `AddToCartButton` client island feeding the zustand store (drawer + header badge react). Build + check-types exit 0. Commit: feat(web) 9ba7c0c.
- F3-4 — `/products/[id]` RSC detail: `await params` (Next 16 Promise style, typegen-safe), `notFound()` for missing or inactive ids, single-image panel, category badge linking back to the filtered listing (breadcrumb "Volver a {rubro}"), price/compareAtPrice/discount, SKU/disponibilidad dl, full description, add-to-cart island reusing the same component as cards (disabled "Sin stock" when stock=0), loading skeleton. Build + check-types exit 0. Commit: feat(web) (this slice).
