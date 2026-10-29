/**
 * `/checkout` — checkout shell (RSC).
 *
 * Gated (Phase 5): requires a verified session; any authenticated role can
 * sell (vendor = sales-only). Orders are attributed to the session user.
 * The page mirrors the demo promo codes into the API module graph (dev
 * graphs isolation) and guarantees the seed before its reads.
 */

import { ShieldCheckIcon } from 'lucide-react';
import {
  DEMO_PROMO_CODES,
  ensureCatalogSeeded,
  syncDemoPromotionsViaApi,
} from '@/lib/seed/catalog-seed';
import { getOwnOriginUrl, requireVerifiedSession } from '@/lib/auth/session';
import { CheckoutForm } from '@/components/checkout/checkout-form';

export default async function CheckoutPage() {
  // Gate first: anonymous users are redirected to /login?next=/checkout.
  const session = await requireVerifiedSession('/checkout');

  // Render workers may boot with empty singleton maps; guarantee the seed.
  ensureCatalogSeeded();

  // The validate/applying routes run in the API module graph, so the demo
  // codes are mirrored there through the promotions HTTP contract before
  // the form can exercise them.
  const origin = await getOwnOriginUrl();
  await syncDemoPromotionsViaApi(origin);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Finalizar compra</h1>
        <p className="text-muted-foreground">
          Completá los datos del negocio, validá tu código y estimá el envío.
          Vendido a nombre de <span className="font-medium">{session.fullName}</span>.
        </p>
      </header>

      <div className="mt-8">
        <CheckoutForm
          demoUserId={session.userId}
          demoPromoCodes={DEMO_PROMO_CODES}
        />
      </div>

      <p className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheckIcon className="size-4 text-secondary" />
        Transacción protegida · el sector comercial valida el pedido antes de
        despacharlo.
      </p>
    </main>
  );
}
