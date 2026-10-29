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
- [x] F3-5 — Home "Destacados" section.
- [x] F3-6 — Work-unit commits per slice with doc evidence ticks.

## Verification evidence

- `npm i` — no new packages needed this phase (zustand existed; no runtime additions). Seed verified mentally against the real contracts: `CategoryManager.create({ name, slug, description, sortOrder, isActive })` and `ProductManager.create(CreateProductInput)` from `lib/types/product.ts` (no `specs` field exists — descriptions carry the tech data; see follow-ups).
- F3-1 — `lib/seed/catalog-seed.ts` (3 categories with slugs pollerias/cafeterias/pizzerias + 15 products with SKU, ARS prices, stock/rating spread including one stock=0 item and one stock=2 item) + `apps/web/instrumentation.ts` `register()` calling `seedCatalog()` (idempotent: skips when any manager already holds rows). `npm run build -w apps/web` exit 0, `check-types` exit 0. Commit: feat(web) c02760c. Placeholder images reuse the starter demo JPGs in `public/products/*` (backpack/headphones/etc. are electronics stand-ins — real gastro imagery is a Phase-6 content task).
- F3-2 — Verified no-change: the Phase-2 header fallback hrefs already point to `/products?category=pollerias|cafeterias|pizzerias`, exactly the canonical slugs; seeded categories regenerate identical hrefs from `findBySlug`. Evidence folded into the F3-3 commit header.
- F3-3 — `/products` RSC listing with `await searchParams` (Next 16 Promise style), `?category=` slug filter + `?search=` case-insensitive name match, category chips, count header ("N equipos"), unknown-category and no-match empty states, `loading.tsx` skeleton grid, `ProductCard` server component (next/image aspect-[4/3] placeholder, discount badge when compareAtPrice, es-AR rating display, SKU line, Agotado / Últimas N unidades stock signals) and `AddToCartButton` client island feeding the zustand store (drawer + header badge react). Build + check-types exit 0. Commit: feat(web) 9ba7c0c.
- F3-4 — `/products/[id]` RSC detail: `await params` (Next 16 Promise style, typegen-safe), `notFound()` for missing or inactive ids, single-image panel, category badge linking back to the filtered listing (breadcrumb "Volver a {rubro}"), price/compareAtPrice/discount, SKU/disponibilidad dl, full description, add-to-cart island reusing the same component as cards (disabled "Sin stock" when stock=0), loading skeleton. Build + check-types exit 0. Commit: feat(web) c61e77f.
- F3-5 — Home "Destacados" section: server-pick from `productManager.getFeatured()` sorted rating desc → price asc → id (deterministic), capped at 4, rendered with the same `ProductCard`; section hidden entirely if the seed has not supplied ≥4-rated rows (safe during any empty-store state). Hero, vertical cards and shell untouched. Build + check-types exit 0. Commit: feat(web) 0bbc13f.

### Smoke battery (own dev server, port 3000 handed back free afterwards)

- `GET /` → 200, contains "Destacados" with 8 product-card refs (4 cards × flight double-ref). Commit for adjust: fix(web) a42d95d.
- `GET /products` → 200, grid renders seeded rows; captured id `prod_1793254116185_42q6yck` from listing.
- `GET /products?category=pollerias` → 200, "6 equipos en Pollerías", includes "Freidora ...".
- `GET /products?search=freidora` → 200, count "1 equipo" + `para "freidora"`, single match link.
- `GET /products/prod_1793254116185_42q6yck` → 200, product name present.
- `GET /products/prod_bogus` → HTTP 200 body with the not-found UI (marker `could not be found` present). Observed Next dev quirk: with streaming SSR the shell is already flushed when `notFound()` resolves, so the status code stays 200 in dev while the UI is the 404 page; production `next build && next start` returns a real 404 (not re-verified this phase — record only).
- `GET /design-preview` → 200.
- Dev server was killed by this session (npm-cli → next dev → start-server → postcss tree) and port 3000 confirmed free afterwards.

### Final battery

- `npm run build -w apps/web` → exit 0 after every slice (F3-1 c02760c, F3-3 9ba7c0c, F3-4 c61e77f, F3-5 0bbc13f, fix a42d95d).
- `npm run check-types -w apps/web` → exit 0 at final tree.
- `git status` → clean.

## Follow-ups (need domain-layer/user decision)

- `Product` type has no `specs` field: detail pages show the full `description` only. Fichas técnicas (specs table) require a domain-type extension (allowed owner: domain layer, not this phase).
- Listing pagination beyond result count is a follow-up (doc scope note).
- Placeholder imagery: `public/products/*.jpg` are starter electronics demo files; real gastro images are a Phase-6 content task.
- Dev-mode not-found responses stream a 200 status with 404 UI; if a contract test asserts strict 404 status in dev, that needs the framework decision, not a page edit.
