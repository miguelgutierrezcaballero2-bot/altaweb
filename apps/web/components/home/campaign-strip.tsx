/**
 * Campaign strip (Fase 7) — merchandising cards for the REAL seeded
 * promotions. Headline/condition copy is derived from the promotion
 * contract fields only (discountType + minPurchase); nothing is invented.
 */

import { TagIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/components/catalog/product-card';
import type { Promotion } from '@/lib/types/promotion';

/** Headline straight from the contract values. */
function promoHeadline(promotion: Promotion): string {
  return promotion.discountType === 'percentage'
    ? `${promotion.discountValue}% de descuento`
    : `${formatPrice(promotion.discountValue)} de descuento`;
}

/** Purchase condition honestly reflecting minPurchase (or its absence). */
function promoCondition(promotion: Promotion): string {
  return promotion.minPurchase !== null
    ? `Válido en compras desde ${formatPrice(promotion.minPurchase)}`
    : 'Válido en todo el catálogo';
}

export function CampaignStrip({ promotions }: { promotions: Promotion[] }) {
  if (promotions.length === 0) return null;

  return (
    <section aria-label="Campañas vigentes" className="grid gap-4 sm:grid-cols-2">
      {promotions.map((promotion) => (
        <Card
          key={promotion.id}
          className="border-secondary/50 bg-secondary/10 transition-colors hover:border-secondary"
        >
          <CardContent className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <Badge className="font-mono tracking-wide">{promotion.code}</Badge>
              <p className="text-xl font-bold tracking-tight">
                {promoHeadline(promotion)}
              </p>
              <p className="text-sm text-muted-foreground">
                {promoCondition(promotion)}
              </p>
              <p className="text-xs text-muted-foreground">
                Ingresá el código al confirmar tu pedido.
              </p>
            </div>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
              <TagIcon className="size-5" />
            </span>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
