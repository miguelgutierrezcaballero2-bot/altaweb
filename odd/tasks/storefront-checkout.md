# Feature: Storefront Checkout (Fase 4)

## Objective

Close the B2B sales loop: cart drawer → `/checkout` (contact data, promotion code, shipping estimate) → order creation through the existing REST API → order confirmation with tracking.

## Problem

Cart state is client-only zustand; nothing talks to the cart/promotions/shipping/orders API domains, so vendors cannot actually complete a sale.

## Why

Approved plan (Phase 4); the 10 API domains from the domain layer finally meet their consumer.

## Scope

In scope:
- `/checkout` page (RSC shell + client checkout form component): buyer data (business name, contact person, email, notes), cart summary, promotion code validation (`POST /api/promotions/[code]/validate`), shipping estimate (`POST /api/shipping/estimate` wiring per its real contract), submit creates the order via the orders API.
- `/orders/[id]` confirmation page (RSC): order status, items, totals, shipping/tracking data from its real contract.
- Drawer CTA "Continuar compra" → `/checkout`; after successful order: clear local cart, navigate to confirmation.
- installs: `react-hook-form` + `zod` for the checkout form.
- If the orders/cart APIs require a `userId`: extend `lib/seed` with a demo vendor user (idempotent) and record the decision — vendor auth is Phase 5, this is scaffolding for it, noted as follow-up.

Out of scope: real payment gateway, persistence, vendor login (Phase 5), notification UI beyond what APIs return.

## Constraints

- Domain code (`lib/managers/**`, `lib/types/**`) and API routes (`app/api/**`) remain untouched; consume the HTTP contracts exactly as they exist. If a contract blocks the flow (e.g. orders create shape mismatch), record a follow-up in the doc and adapt the form/flow minimally.
- Keep `/products`, `/products/[id]`, `/design-preview` untouched and 200.
- Errors from API calls surface visibly in the form (no silent failures). es-ar copy, English code.

## Checklist

- [x] F4-1 — Install forms deps; read all four API contract families (cart, promotions, shipping, orders) and document the exact request/response shapes in the doc.
- [ ] F4-2 — `/checkout` page + client form with cart summary, promo code, shipping estimate, submit.
- [ ] F4-3 — `/orders/[id]` confirmation with status/items/totals/tracking; skeleton files.
- [ ] F4-4 — Drawer CTA wiring + post-order cleanup (clearCart + redirect).
- [ ] F4-5 — Work-unit commits per slice with evidence ticks.

## HTTP contract shapes (F4-1 evidence — read from `app/api/**` + `lib/{managers,types}/**`)

Important correction to the brief: promo validation and shipping estimation are **GET with query params**, not POST. `POST /api/promotions/[code]/validate` is a *different* operation (applies the discount, increments `usesCount`).

### Orders — `POST /api/orders` (order creation)

Body = `CreateOrderInput` (`lib/types/order.ts`, passed verbatim to `OrderManager.create`):

```jsonc
{
  "userId": "usr_...",               // required string, no FK validation server-side
  "items": [                          // OrderItem[] — server recomputes totals; `quantity` (not `qty`)
    { "productId": "prod_...", "name": "...", "price": 123456, "quantity": 2, "image": "/products/x.jpg" }
  ],
  "paymentMethod": "transferencia",   // opaque string, stored as-is
  "shippingAddress": { "street": "", "city": "", "state": "", "zip": "", "country": "" }, // Address — all 5 required
  "billingAddress": { "street": "", "city": "", "state": "", "zip": "", "country": "" },
  "trackingNumber": null              // optional
}
```

- 201 → `{ "order": { id, userId, items, subtotal, tax, total, status: 'pending', paymentMethod, shippingAddress, billingAddress, trackingNumber, createdAt, updatedAt } }`. Server total = subtotal + 8% tax — **no promo discount and no shipping cost exist on the Order entity** (domain gap, see follow-ups).
- 400 → `{ "error": "Failed to create order" }` (malformed JSON; no field validation server-side).
- `GET /api/orders` → `{ orders }` (all), `?userId=` → `{ orders }` (by user), `?status=` → `{ orders }`.
- `GET /api/orders/[id]` → 200 `{ order }` / 404 `{ "error": "Order not found" }`.
- `PUT /api/orders/[id]` = status update (`{ status }`); `DELETE /api/orders/[id]` = cancel.

### Promotions — `GET /api/promotions/[code]/validate` (validation)

Query: `?purchaseAmount=<number>` (optional; enables `minPurchase` check and is the volume for percentage discounts) and `?categoryId=<id>` (optional; checked only if the promotion declares `applicableCategories`).

- 200 → `{ "validation": { "isValid": true, "promotion": {...Promotion}, "discountAmount": <number rounded 2dp>, "error": null } }`.
- 200 with `isValid: false` → `{ "validation": { "isValid": false, "promotion": null, "discountAmount": 0, "error": "Invalid promo code" | "Promotion is not active" | "Promotion has expired" | "Promotion has reached max uses" | "Minimum purchase of $X required" | "Promotion not applicable to this category" } }`. Note: unknown code is still HTTP 200 (the error travels in the body).
- `POST /api/promotions/[code]/validate` → applies discount: 200 `{ promotion }` (with `usesCount` +1) / 400 `{ "error": "Failed to apply discount" }`.
- `GET /api/promotions` → `{ promotions, activePromotions }`; `POST /api/promotions` creates (CreatePromotionInput).

### Shipping — `GET /api/shipping/estimate` (cost estimation)

Query: `?street=&city=&state=&zip=&country=&weight=<number default 1>&method=<string default 'Standard'>`. Address fields only select the estimator; they are not stored.

- 200 → `{ "estimates": [ { "carrier": "Standard" | "Express" | "Overnight", "method": "<echoed>", "cost": <number>, "estimatedDelivery": "<ISO date>" } ] }` — always 3 rows. Cost formula: `weight × 2.5 + carrierSurcharge(0 / 15 / 30)`.

### Shipping — order linkage + tracking (for the confirmation page)

- `GET /api/shipping?orderId=<orderId>` → 200 `{ "shipping": {...Shipping} }` / 404 `{ "error": "Shipping not found" }` (no shipment exists unless something POSTs one).
- `GET /api/shipping/[id]/tracking` → 200 `{ "tracking": { trackingNumber, carrier, status, estimatedDelivery, shippedAt, deliveredAt, events } }` / 404.
- No code path creates a `Shipping` during order creation — `/orders/[id]` must handle the no-shipment state.

### Cart (domain observed, intentionally NOT consumed this phase)

`GET /api/cart` → `{ carts }` (`?userId=` filtered); `POST /api/cart` creates with CreateCartInput (`{ userId?, items?: CartItem[], discountCode? }`, totals server-computed incl. 8% tax and 10% flat discount if `discountCode` present — a placeholder that ignores the Promotions domain). The checkout keeps the zustand cart as single client source of truth (Phase 2 decision) and maps `qty` → `quantity` only at order submission; server-cart sync is recorded as a follow-up.


## Route declaration

- Delegated direct writer (continuing session). Verification per Delegated Verification Gate unassessable tier: writer self-verification + parent spot check + parent browser interaction pass.

## Forecast and delivery

- Forecast: ~650 authored lines across 2 pages + 1-2 client components + seed tweak. Strategy: ask-on-risk; commit per slice; no chaining (no PR yet).

## Acceptance criteria

1. Build + check-types exit 0.
2. Browser E2E by hand: seeded product → add → drawer → checkout form (promo code OK/invalid shows both outcomes, shipping estimate returns figure, submit) → confirmation page shows the order.
3. Checklist ticks with observed evidence; API shapes documented in the doc.
