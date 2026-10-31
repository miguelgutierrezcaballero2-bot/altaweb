/**
 * Storefront home merchandising, backed by the seeded catalog and promotions.
 */

import Link from "next/link";
import { ClockIcon, ShieldCheckIcon, TagIcon, TruckIcon } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, ProductCard } from "@/components/catalog/product-card";
import { categoryManager } from "@/lib/managers/category-manager";
import { productManager } from "@/lib/managers/product-manager";
import { promotionManager } from "@/lib/managers/promotion-manager";
import { ensureCatalogSeeded } from "@/lib/seed/catalog-seed";
import { CampaignStrip } from "@/components/home/campaign-strip";
import { CategoryTiles } from "@/components/home/category-tiles";
import { QuoteTeaser } from "@/components/home/quote-teaser";

/** Trust strip copy sourced from the footer contract (existing business facts). */
const TRUST_POINTS = [
  { icon: TagIcon, label: "Cotizaciones B2B por rubro" },
  { icon: ClockIcon, label: "Atención comercial: Lun a Vie, 9 a 18 h" },
  { icon: TruckIcon, label: "Flete e instalación en todo el país" },
  { icon: ShieldCheckIcon, label: "Garantía oficial y repuestos" },
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
  // Use the same deterministic merchandising order for the hero and product row.
  const destacados = productManager
    .getFeatured()
    .toSorted(
      (a, b) =>
        b.rating - a.rating || a.price - b.price || a.id.localeCompare(b.id),
    )
    .slice(0, 4);
  const heroProduct = destacados[0];
  const categoryImages = Object.fromEntries(
    [
      ["pollerias", "POL-ABL-001"],
      ["cafeterias", "CAF-SAM-001"],
      ["pizzerias", "PZX-IMP-001"],
    ].flatMap(([slug, sku]) => {
      const category = categories.find((item) => item.slug === slug);
      const product = productManager.findAll().find((item) => item.sku === sku);
      return category && product?.images[0]
        ? [[category.id, product.images[0]]]
        : [];
    }),
  );

  return (
    <main className="mx-auto w-full max-w-7xl space-y-12 px-4 py-6 sm:space-y-16 sm:py-10">
      <section
        aria-labelledby="home-title"
        className="relative isolate overflow-hidden rounded-2xl bg-[#3d2b1f] text-[#fff8f1] shadow-lg"
      >
        <div className="grid min-h-[25rem] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative z-10 flex flex-col items-start justify-center gap-5 p-6 sm:p-10 lg:p-12">
            <Badge className="border border-white/20 bg-white/10 text-white hover:bg-white/10">
              Equipamiento gastronómico B2B
            </Badge>
            <div className="max-w-xl space-y-4">
              <h1
                id="home-title"
                className="text-4xl font-bold leading-[1.08] tracking-tight text-balance sm:text-5xl"
              >
                Todo listo para hacer crecer tu cocina.
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">
                Equipos profesionales para pollerías, cafeterías y pizzerías,
                con atención comercial y cotizaciones por rubro.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href="/products" />}
              >
                Explorar equipos
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
                nativeButton={false}
                render={<Link href="/quote" />}
              >
                Pedir cotización
              </Button>
            </div>
            {campaigns[0] && (
              <p className="text-sm text-white/75">
                Promoción vigente:{" "}
                <span className="font-semibold text-white">
                  {campaigns[0].code}
                </span>
              </p>
            )}
          </div>

          {heroProduct && (
            <Link
              href={`/products/${heroProduct.id}`}
              className="group relative min-h-64 overflow-hidden bg-[#f7efe5] lg:min-h-full"
              aria-label={`Ver ${heroProduct.name}`}
            >
              <Image
                src={heroProduct.images[0]}
                alt={heroProduct.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-contain p-8 transition-transform duration-500 group-hover:scale-105 sm:p-12"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-6 pb-5 pt-16 text-white sm:px-8">
                <p className="text-xs font-semibold tracking-[0.16em] text-white/70 uppercase">
                  Equipo destacado
                </p>
                <p className="mt-1 text-lg font-semibold">{heroProduct.name}</p>
                <p className="mt-1 text-sm font-bold">
                  {formatPrice(heroProduct.price)}
                </p>
              </div>
            </Link>
          )}
        </div>
      </section>

      <div className="space-y-12 sm:space-y-16">
        <CampaignStrip promotions={campaigns} />
        <CategoryTiles
          categories={categories}
          imageByCategory={categoryImages}
        />

        {destacados.length > 0 && (
          <section aria-label="Equipos destacados" className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                  Selección AltaCocina
                </p>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Equipos destacados
                </h2>
                <p className="text-sm text-muted-foreground sm:text-base">
                  Soluciones elegidas para el trabajo de todos los días.
                </p>
              </div>
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href="/products" />}
              >
                Ver todo el catálogo
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
          className="grid gap-3 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground sm:grid-cols-2 sm:p-6 lg:grid-cols-4"
        >
          {TRUST_POINTS.map((point) => (
            <span
              key={point.label}
              className="flex items-center gap-3 rounded-lg px-2 py-2"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <point.icon className="size-5" />
              </span>
              <span className="font-medium text-foreground/80">
                {point.label}
              </span>
            </span>
          ))}
        </section>
      </div>
    </main>
  );
}
