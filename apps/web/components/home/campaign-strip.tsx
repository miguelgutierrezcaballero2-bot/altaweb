/**
 * Campaign strip (Fase 7) — merchandising cards for the REAL seeded
 * promotions. Headline/condition copy is derived from the promotion
 * contract fields only (discountType + minPurchase); nothing is invented.
 */

import { TagIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/components/catalog/product-card";
import type { Promotion } from "@/lib/types/promotion";

/** Headline straight from the contract values. */
function promoHeadline(promotion: Promotion): string {
  return promotion.discountType === "percentage"
    ? `${promotion.discountValue}% de descuento`
    : `${formatPrice(promotion.discountValue)} de descuento`;
}

/** Purchase condition honestly reflecting minPurchase (or its absence). */
function promoCondition(promotion: Promotion): string {
  return promotion.minPurchase !== null
    ? `Válido en compras desde ${formatPrice(promotion.minPurchase)}`
    : "Válido en todo el catálogo";
}

export function CampaignStrip({ promotions }: { promotions: Promotion[] }) {
  if (promotions.length === 0) return null;

  return (
    <section
      aria-label="Campañas vigentes"
      className="grid gap-4 sm:grid-cols-2"
    >
      {promotions.map((promotion) => (
        <Card
          key={promotion.id}
          className="overflow-hidden border-secondary/30 bg-card p-0 transition-all duration-200 hover:-translate-y-0.5 hover:border-secondary/60 hover:shadow-md"
        >
          <CardContent className="flex h-full items-center justify-between gap-4 border-l-4 border-primary bg-gradient-to-r from-primary/5 to-transparent p-5 sm:p-6">
            <div className="space-y-1.5">
              <Badge variant="secondary" className="font-mono tracking-wide">
                Código: {promotion.code}
              </Badge>
              <p className="text-xl font-bold tracking-tight sm:text-2xl">
                {promoHeadline(promotion)}
              </p>
              <p className="text-sm text-muted-foreground">
                {promoCondition(promotion)}
              </p>
              <p className="text-xs text-muted-foreground">
                Ingresá el código al confirmar tu pedido.
              </p>
            </div>
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-14">
              <TagIcon className="size-6" />
            </span>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
