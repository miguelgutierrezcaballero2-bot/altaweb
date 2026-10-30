/**
 * `/products` — faceted catalog listing (RSC, Fase 8).
 *
 * URL grammar (all server-applied during render; also the header contract):
 *   ?category=<slug>   rubro facet — pollerias | cafeterias | pizzerias
 *   ?search=<text>     name-only search (documented contract limit)
 *   ?min=&max=         price-band bounds in ARS (facet chips map to bands)
 *   ?stock=in          availability facet — only products with stock > 0
 *   ?sort=             relevancia (default) | price-asc | price-desc |
 *                      rating | novedad
 * Facet counts aggregate over the set filtered by every OTHER facet; the
 * API route (/api/products) does not expose sort/price params — recorded
 * follow-up in the task doc.
 */

import Link from 'next/link';
import { categoryManager } from '@/lib/managers/category-manager';
import { productManager } from '@/lib/managers/product-manager';
import { ensureCatalogSeeded } from '@/lib/seed/catalog-seed';
import { ProductCard } from '@/components/catalog/product-card';
import {
  FacetSidebar,
  FilterChips,
  SortForm,
  type FacetGroup,
  type SortOption,
} from '@/components/catalog/catalog-filters';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Catálogo',
  description:
    'Equipamiento gastronómico B2B: freidoras, hornos, molinos y refrigeración para tu negocio.',
};

interface ProductsPageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'relevancia', label: 'Relevancia' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'rating', label: 'Mejor valorados' },
  { value: 'novedad', label: 'Novedades' },
];

const VALID_SORTS = new Set(SORT_OPTIONS.map((option) => option.value));

/**
 * Fixed price bands over the REAL seeded price range (approximate shop
 * bands; the numeric min/max params are what filtering actually uses).
 */
const PRICE_BANDS = [
  { label: 'hasta $500.000', min: null as number | null, max: 500000 },
  { label: '$500.000 a $1.500.000', min: 500000, max: 1500000 },
  { label: 'más de $1.500.000', min: 1500000, max: null as number | null },
];

function normalizeParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string' && value.trim().length > 0) return value.trim();
  return undefined;
}

/** Deterministic query builder: fixed key order, only set values. */
function buildQuery(entries: Record<string, string | undefined>): string {
  const keys = ['category', 'search', 'min', 'max', 'stock', 'sort'] as const;
  const search = new URLSearchParams();
  for (const key of keys) {
    const value = entries[key];
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

function normalizeSort(value: string | undefined): string {
  return value && VALID_SORTS.has(value) ? value : 'relevancia';
}

function parseAmount(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

type Product = ReturnType<typeof productManager.findAll>[number];

function sortProducts(products: Product[], sort: string): Product[] {
  // toSorted is stable, so 'relevancia' keeps the seed listing order.
  return products.toSorted((a, b) => {
    switch (sort) {
      case 'price-asc':
        return a.price - b.price || a.id.localeCompare(b.id);
      case 'price-desc':
        return b.price - a.price || a.id.localeCompare(b.id);
      case 'rating':
        return (
          b.rating - a.rating || a.price - b.price || a.id.localeCompare(b.id)
        );
      case 'novedad':
        return (
          b.createdAt.getTime() - a.createdAt.getTime() ||
          a.sku.localeCompare(b.sku)
        );
      default:
        return 0;
    }
  });
}

function isBandActive(band: { min: number | null; max: number | null }, minAmount: number | undefined, maxAmount: number | undefined): boolean {
  return (minAmount ?? null) === band.min && (maxAmount ?? null) === band.max;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // Render workers may boot with empty singleton maps; guarantee the seed.
  ensureCatalogSeeded();
  const params = await searchParams;
  const search = normalizeParam(params.search);
  const categorySlug = normalizeParam(params.category);
  const sort = normalizeSort(normalizeParam(params.sort));
  const minAmount = parseAmount(normalizeParam(params.min));
  const maxAmount = parseAmount(normalizeParam(params.max));
  const inStockOnly = normalizeParam(params.stock) === 'in';

  // Current filter params, for chips and carry-over links.
  const currentParams: Record<string, string | undefined> = {
    category: categorySlug,
    search,
    min: minAmount !== undefined ? String(minAmount) : undefined,
    max: maxAmount !== undefined ? String(maxAmount) : undefined,
    stock: inStockOnly ? 'in' : undefined,
    sort: sort !== 'relevancia' ? sort : undefined,
  };

  const categories = categoryManager
    .findAll()
    .toSorted((a, b) => a.sortOrder - b.sortOrder);

  const activeCategory = categorySlug
    ? categories.find((category) => category.slug === categorySlug)
    : undefined;

  const unknownCategory = Boolean(categorySlug && !activeCategory);

  // Base sets: category-scoped for the listing, full reference for facets.
  const reference = productManager
    .findAll()
    .filter((product) => product.isActive);
  const scoped = activeCategory
    ? reference.filter((product) => product.categoryId === activeCategory.id)
    : reference;

  /** Applies search + price + stock (the "other" facet dimensions). */
  function applyOtherFilters(
    products: Product[],
    withoutPrice = false,
  ): Product[] {
    let filtered = products;
    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(query),
      );
    }
    if (!withoutPrice) {
      if (minAmount !== undefined) {
        filtered = filtered.filter((product) => product.price >= minAmount);
      }
      if (maxAmount !== undefined) {
        filtered = filtered.filter((product) => product.price <= maxAmount);
      }
    }
    if (inStockOnly) {
      filtered = filtered.filter((product) => product.stock > 0);
    }
    return filtered;
  }

  const listed = sortProducts(applyOtherFilters(scoped), sort);

  // Facet counts — aggregated over every OTHER facet dimension applied.
  const othersOnFull = applyOtherFilters(reference);
  const othersOnScoped = applyOtherFilters(scoped);
  const countByCategory = new Map<string, number>();
  for (const product of othersOnFull) {
    countByCategory.set(
      product.categoryId,
      (countByCategory.get(product.categoryId) ?? 0) + 1,
    );
  }
  const inStockCount = othersOnScoped.filter(
    (product) => product.stock > 0,
  ).length;

  const groups: FacetGroup[] = [
    {
      title: 'Rubro',
      options: [
        {
          label: 'Todos los rubros',
          count: othersOnFull.length,
          href: `/products${buildQuery({
            search: currentParams.search,
            min: currentParams.min,
            max: currentParams.max,
            stock: currentParams.stock,
            sort: currentParams.sort,
          })}`,
          active: !activeCategory,
        },
        ...categories.map((category) => ({
          label: category.name,
          count: countByCategory.get(category.id) ?? 0,
          href: `/products${buildQuery({
            ...currentParams,
            category: category.slug,
          })}`,
          active: activeCategory?.slug === category.slug,
        })),
      ],
    },
    {
      title: 'Precio',
      hint: 'franjas aprox.',
      options: PRICE_BANDS.map((band) => ({
        label: band.label,
        count: othersOnScoped.filter(
          (product) =>
            (band.min ?? 0) <= product.price &&
            (band.max === null || product.price <= band.max),
        ).length,
        href: `/products${buildQuery({
          ...currentParams,
          min: band.min !== null ? String(band.min) : undefined,
          max: band.max !== null ? String(band.max) : undefined,
        })}`,
        active: isBandActive(band, minAmount, maxAmount),
      })),
    },
    {
      title: 'Disponibilidad',
      options: [
        {
          label: 'Con stock',
          count: inStockCount,
          href: `/products${buildQuery({
            ...currentParams,
            stock: inStockOnly ? undefined : 'in',
          })}`,
          active: inStockOnly,
        },
      ],
    },
  ];

  // Active filter chips (sort is a control, not a filter).
  const chips: { label: string; href: string }[] = [];
  if (activeCategory) {
    chips.push({
      label: activeCategory.name,
      href: `/products${buildQuery({ ...currentParams, category: undefined })}`,
    });
  }
  if (search) {
    chips.push({
      label: `Búsqueda: ${search}`,
      href: `/products${buildQuery({ ...currentParams, search: undefined })}`,
    });
  }
  const activeBand = PRICE_BANDS.find((band) =>
    isBandActive(band, minAmount, maxAmount),
  );
  if (activeBand) {
    chips.push({
      label: `Precio: ${activeBand.label}`,
      href: `/products${buildQuery({
        ...currentParams,
        min: undefined,
        max: undefined,
      })}`,
    });
  }
  if (inStockOnly) {
    chips.push({
      label: 'Con stock',
      href: `/products${buildQuery({ ...currentParams, stock: undefined })}`,
    });
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">
          {activeCategory ? activeCategory.name : 'Catálogo'}
        </h1>
        <p className="text-muted-foreground">
          {activeCategory
            ? activeCategory.description
            : 'Equipamiento gastronómico B2B con garantía oficial y flete al país.'}
        </p>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[15rem_1fr]">
        {unknownCategory ? (
          <UnknownCategorySection />
        ) : (
          <>
            <FacetSidebar groups={groups} />

            <div className="min-w-0 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {listed.length} {listed.length === 1 ? 'equipo' : 'equipos'}
                  {activeCategory ? ` en ${activeCategory.name}` : ''}
                  {search ? ` para “${search}”` : ''}
                </p>
                <SortForm
                  current={sort}
                  options={SORT_OPTIONS}
                  hidden={{
                    category: currentParams.category,
                    search: currentParams.search,
                    min: currentParams.min,
                    max: currentParams.max,
                    stock: currentParams.stock,
                  }}
                />
              </div>

              <FilterChips chips={chips} clearHref="/products" />

              {listed.length === 0 ? (
                <section className="rounded-xl border border-border bg-muted/40 p-10 text-center">
                  <p className="text-lg font-semibold">
                    No encontramos equipos con esos filtros
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Probá quitando una franja de precio o ampliá la búsqueda.
                  </p>
                  <Link
                    href="/products"
                    className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
                  >
                    Limpiar filtros
                  </Link>
                </section>
              ) : (
                <section
                  aria-label="Equipos disponibles"
                  className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {listed.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function UnknownCategorySection() {
  return (
    <section className="col-span-full rounded-xl border border-border bg-muted/40 p-10 text-center">
      <p className="text-lg font-semibold">No encontramos esa categoría</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Volvé al catálogo completo para seguir explorando.
      </p>
      <Link
        href="/products"
        className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
      >
        Ver todos los equipos
      </Link>
    </section>
  );
}
