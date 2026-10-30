/**
 * Storefront home (Fase 7) — merchandising rebuild.
 * No hero: navigation/search live in the header, so the page opens with a
 * compact intro and goes straight to the merchandising flow — seeded promo
 * campaigns, category tiles, featured row, quote teaser, trust strip.
 * All reads run against the real contracts after the render-graph seed.
 */

import {
  ClockIcon,
  ShieldCheckIcon,
  TagIcon,
  TruckIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { categoryManager } from '@/lib/managers/category-manager';
import { productManager } from '@/lib/managers/product-manager';
import { promotionManager } from '@/lib/managers/promotion-manager';
import { ensureCatalogSeeded } from '@/lib/seed/catalog-seed';
import { ProductCard } from '@/components/catalog/product-card';
import { CampaignStrip } from '@/components/home/campaign-strip';
import { CategoryTiles } from '@/components/home/category-tiles';
import { QuoteTeaser } from '@/components/home/quote-teaser';

/** Trust strip copy sourced from the footer contract (existing business facts). */
const TRUST_POINTS = [
  { icon: TagIcon, label: 'Cotizaciones B2B por rubro' },
  { icon: ClockIcon, label: 'Atención comercial: Lun a Vie, 9 a 18 h' },
  { icon: TruckIcon, label: 'Flete e instalación en todo el país' },
  { icon: ShieldCheckIcon, label: 'Garantía oficial y repuestos' },
];

export default function HomePage() {
  // Render workers may boot with empty singleton maps; guarantee the seed.
  ensureCatalogSeeded();
  // Active promotions (isActive + validity window per contract), stable by code.
  const campaigns = promotionManager
    .getActivePromotions()
    .toSorted((a, b) => a.code.localeCompare(b.code));
  const categories = categoryManager
    .findAll()
    .toSorted((a, b) => a.sortOrder - b.sortOrder);
  // Deterministic featured pick: top-rated active products, stable by
  // rating desc then price asc then id, capped at 4 (legacy Destacados).
  const destacados = productManager
    .getFeatured()
    .toSorted(
      (a, b) => b.rating - a.rating || a.price - b.price || a.id.localeCompare(b.id)
    )
    .slice(0, 4);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
      {/* Compact intro — the merchandising flow is the page, not a hero band. */}
      <section className="mx-auto max-w-3xl space-y-3 text-center">
        <Badge variant="secondary" className="text-sm">
          Ventas mayoristas B2B
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Equipamiento gastronómico para tu negocio
        </h1>
        <p className="text-muted-foreground text-pretty">
          Armá pollerías, cafeterías y pizzerías con maquinaria de uso
          intensivo — con cotizaciones por rubro, flete e instalación.
        </p>
      </section>

      <div className="mt-8 space-y-14">
        <CampaignStrip promotions={campaigns} />
        <CategoryTiles categories={categories} />

        {destacados.length > 0 && (
          <section aria-label="Equipos destacados" className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">Destacados</h2>
                <p className="text-muted-foreground">
                  Los equipos mejor valorados por nuestros clientes B2B.
                </p>
              </div>
              <Button variant="outline" nativeButton={false} render={<Link href="/quote" />}>
                Pedir cotización
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {destacados.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        <QuoteTeaser />

        <section
          aria-label="Beneficios de comprar en AltaCocina"
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-border pt-8 text-sm text-muted-foreground"
        >
          {TRUST_POINTS.map((point) => (
            <span key={point.label} className="flex items-center gap-2">
              <point.icon className="size-4 text-primary" />
              {point.label}
            </span>
          ))}
        </section>
      </div>
    </main>
  );
}
