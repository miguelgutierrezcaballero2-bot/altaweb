/**
 * Featured-category tiles (Fase 7) — token-styled tiles per REAL category.
 * The category contract carries no image data, so each tile maps the slug
 * to a lucide icon (neutral fallback for future categories) instead of
 * faking visual assets.
 */

import Link from 'next/link';
import {
  ArrowRightIcon,
  CoffeeIcon,
  CookingPotIcon,
  FlameIcon,
  PizzaIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { Category } from '@/lib/types/category';

const ICONS_BY_SLUG: Record<string, typeof FlameIcon> = {
  pollerias: FlameIcon,
  cafeterias: CoffeeIcon,
  pizzerias: PizzaIcon,
};

export function CategoryTiles({ categories }: { categories: Category[] }) {
  return (
    <section aria-label="Equipamiento por rubro" className="grid gap-4 sm:grid-cols-3">
      {categories.map((category) => {
        const Icon = ICONS_BY_SLUG[category.slug] ?? CookingPotIcon;
        return (
          <Card key={category.id} className="overflow-hidden p-0">
            <Link
              href={`/products?category=${category.slug}`}
              className="group flex h-full flex-col gap-3 p-6"
            >
              <span className="flex size-11 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-6" />
              </span>
              <h3 className="text-lg font-bold tracking-tight">{category.name}</h3>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {category.description}
              </p>
              <span className="mt-auto flex items-center gap-1.5 text-sm font-semibold text-primary">
                Ver equipos de {category.name.toLowerCase()}
                <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </Card>
        );
      })}
    </section>
  );
}
