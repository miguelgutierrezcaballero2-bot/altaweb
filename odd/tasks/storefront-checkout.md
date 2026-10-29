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
- [x] F4-2 — `/checkout` page + client form with cart summary, promo code, shipping estimate, submit.
- [x] F4-3 — `/orders/[id]` confirmation with status/items/totals/tracking; skeleton files.
- [x] F4-4 — Drawer CTA wiring + post-order cleanup (clearCart + redirect).
- [x] F4-5 — Work-unit commits per slice with evidence ticks.

## Dev-Turbopack module-graph topology (Phase-4 discovery, drives the design)

Next 16.2 Turbopack dev holds **three separate in-memory manager graphs**: the `instrumentation.register()` boot process, the RSC page render graph, and the API route-handler graph. Evidence: promo codes seeded at boot or at `/checkout` render were invisible to `GET /api/promotions/[code]/validate` (`Invalid promo code`), while POST→GET **within** the orders route family shares one graph (`POST /api/orders` → `GET /api/orders/[id]` 200). Consequences consumed here:

- **`/orders/[id]` reads via own-origin HTTP** (`GET /api/orders/[id]` with base from `await headers()` + `cache: 'no-store'`), not via direct manager read — order data only exists inside the API graph after a browser POST, as Phase 3's divergent-singleton bug class predicted.
- **Demo promo codes are mirrored into the API graph** by the `/checkout` shell through the promotions HTTP contract (`syncDemoPromotionsViaApi`: `GET /api/promotions?code=X` → 404 ⇒ `POST /api/promotions`, idempotent; logs show exactly one POST 201 per code). This is frontend-side scaffolding only; domain code untouched.
- **Demo vendor user needs no mirroring**: `CreateOrderInput.userId` is an opaque required string with no FK check server-side, so the render-graph demo user id passes through order submission untouched.
- In production (`next build && next start`) there is a single module graph; `syncDemoPromotionsViaApi` short-circuits via the GET check, so behavior stays idempotent there too.

## Verification evidence

- F4-1 — commit `dcbc571`: `npm i -w apps/web react-hook-form zod @hookform/resolvers` (plain npm, `INSTALL_EXIT=0`): rhf 7.91 / zod 4.6.7 / resolvers 6.0.2, all in `dependencies` (they ship in the client bundle). Full HTTP contract shapes documented in this doc above.
- F4-2 — commit `d3f6530` (`/checkout` shell + form + seed scaffolding) and `fix` commit (promo API sync). Details:
  - Seed: `seedCatalog()` restructured into three independently-guarded sections (catalog / demo user / demo promotions). Demo vendor user `compras@negocio.demo` (role admin) is explicit **Phase-5-auth scaffolding**: `CreateOrderInput.userId` is required and the storefront has no auth yet. Demo promo codes `BIENVENIDA10` (10% pct, min $100.000) and `GASTRO20K` ($20.000 fixed, min $800.000) are shown as a hint in the form.
  - Form: rhf+zod (es-ar copy), cart summary from zustand (`qty` → `quantity` mapping at submit), promo validate GET with `purchaseAmount=subtotal` and es-ar translation of the domain's English error strings, shipping estimate GET with `weight: totalUnits` proxy (products carry no weight field), carrier toggle buttons, `POST /api/orders` with the exact `CreateOrderInput` shape (single address reused for shipping+billing, `paymentMethod: 'transferencia'`), then `clearCart()` + `router.push(/orders/<id>)`.
- F4-3 — commit `77c1014`: `/orders/[id]` + `loading.tsx` per the topology section above; `notFound()` on non-OK; shipping panel is best-effort `GET /api/shipping?orderId=` with the explicit "sin datos de despacho" state (the domain creates no shipment at order time — contract, not error).
- F4-4 — commit `8c5d772`: drawer "Continuar compra" now targets `/checkout`, keeping the existing `closeCart={onClick}` wiring.

### Smoke battery (own dev server; port verified free before, handed back free after)

- `npm run build -w apps/web` → `BUILD_EXIT=0` after every slice.
- `npm run check-types -w apps/web` → `TYPECHECK_EXIT=0` at final tree.
- Contract proofs (route level):
  - `GET /api/promotions/BIENVENIDA10/validate?purchaseAmount=1000000` → `{isValid:true, discountAmount:100000}` (10% — before the API-graph sync this returned `Invalid promo code`, which is what motivated the sync).
  - `GET /api/promotions/GASTRO20K/validate?purchaseAmount=1000000` → `{isValid:true, discountAmount:20000}` (fixed).
  - Below minimum (`purchaseAmount=50000`) → `{isValid:false, error:"Minimum purchase of $100000 required"}` (HTTP 200 — error travels in the body).
  - Unknown code → `{isValid:false, error:"Invalid promo code"}` (HTTP 200).
  - `GET /api/shipping/estimate?weight=2&country=Argentina` → 3 estimates (`Standard/Express/Overnight`, cost `5/20/35`, ISO `estimatedDelivery`).
  - `POST /api/orders` (CreateOrderInput, 2×1M + 1×500k) → 201 `{order.id:"ord_1793255137773_g4l6466", total:2700000 (subtotal+8%), status:"pending"}`.
  - `GET /api/orders/ord_1793255137773_g4l6466` → 200 `{order}` (POST→GET share the API graph).
  - `GET /api/shipping?orderId=...` → 404 (expected: no shipment created at order time).
- Page level:
  - `GET /checkout` → 200, "Finalizar compra" + demo codes hint present; sync logs `GET ?code= 404 → POST /api/promotions 201` exactly once per code.
  - `GET /orders/ord_..._g4l6466` → 200 with "Pedido confirmado", status badge "Pendiente", item lines, total `$2.700.000`, address block; despacho panel in the no-shipment state.
  - `GET /orders/ord_bogus` → dev-streamed HTTP 200 with the 404 UI body (no "Pedido confirmado" in body) — same documented Next dev quirk as Phase 3; production `next start` returns a real 404.
  - `GET /products`, `/design-preview`, `/` → 200.
- Dev-server tree killed (npm → next dev → start-server); **port 3000 handed back free**, confirmed by listener check.

## Follow-ups (need domain-layer/user decision)

- `Order`/`CreateOrderInput` carry no discount or shipping fields: the promo discount and shipping cost are checkout-preview lines only; the order's `total` (subtotal + 8% tax) never reflects them. Needs a domain decision (fields or a totals-composition hook) — the form honestly labels the summary "total estimado / lo confirma el sector comercial".
- `CreateOrderInput` lacks business-name / contact / notes fields: they are captured and validated in the form but cannot cross to the entity. Domain extension needed (or a buyer-info sub-object on the order).
- Promo `usesCount` is not incremented on checkout submit: `POST /api/promotions/[code]/validate` (apply) exists but nothing in the order flow calls it. Needs a domain hook at order creation (`applyDiscount(code)`) — intentionally not faked client-side.
- Demo vendor user (`compras@negocio.demo`) and demo promo codes are Phase-5-auth scaffolding; real sessions replace the demo `userId` and the promo-sync bridge.
- No server-cart sync: the zustand cart stays the single client source of truth; `POST /api/cart` (with its placeholder 10% discount logic) is intentionally unused this phase.
- Dev-mode 404 quirk (from Phase 3) also applies to `/orders/[id]`.

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
