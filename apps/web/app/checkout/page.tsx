/**
 * `/checkout` — checkout shell (RSC).
 *
 * The page itself is server-rendered; the form is the client island.
 * The demo vendor user is resolved here (Phase-5-auth scaffolding) and the
 * seed is guaranteed before the reads, following the Phase 3 pattern.
 */

import Link from 'next/link';
import { ShieldCheckIcon } from 'lucide-react';
import { userManager } from '@/lib/managers/user-manager';
import {
  DEMO_PROMO_CODES,
  DEMO_USER_EMAIL,
  ensureCatalogSeeded,
} from '@/lib/seed/catalog-seed';
import { CheckoutForm } from '@/components/checkout/checkout-form';

export default function CheckoutPage() {
  // Render workers may boot with empty singleton maps; guarantee the seed.
  ensureCatalogSeeded();

  const demoUser = userManager.findByEmail(DEMO_USER_EMAIL);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Finalizar compra</h1>
        <p className="text-muted-foreground">
          Completá los datos del negocio, validá tu código y estimá el envío.
          Cuenta para facturación B2B, no requiere registro.
        </p>
      </header>

      <div className="mt-8">
        <CheckoutForm
          demoUserId={demoUser?.id ?? null}
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
