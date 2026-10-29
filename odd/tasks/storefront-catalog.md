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

- [ ] F3-1 — Seed data + `instrumentation.ts` one-shot seeding (idempotent), categories match nav slugs.
- [ ] F3-2 — Header nav hrefs aligned to `?category=` slugs.
- [ ] F3-3 — `/products` listing + loading skeleton + product card + client "Agregar".
- [ ] F3-4 — `/products/[id]` detail + loading skeleton + 404.
- [ ] F3-5 — Home "Destacados" section.
- [ ] F3-6 — Work-unit commits per slice with doc evidence ticks.
