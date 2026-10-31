/** Category cards use catalog photos, with an icon fallback for new categories. */

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRightIcon,
  CoffeeIcon,
  CookingPotIcon,
  FlameIcon,
  PizzaIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Category } from "@/lib/types/category";

const ICONS_BY_SLUG: Record<string, typeof FlameIcon> = {
  pollerias: FlameIcon,
  cafeterias: CoffeeIcon,
  pizzerias: PizzaIcon,
};

export function CategoryTiles({
  categories,
  imageByCategory,
}: {
  categories: Category[];
  imageByCategory: Record<string, string>;
}) {
  return (
    <section aria-label="Equipamiento por rubro" className="space-y-5">
      <div className="space-y-1">
        <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
          Encontrá lo que necesitás
        </p>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Equipamiento por rubro
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {categories.map((category) => {
          const Icon = ICONS_BY_SLUG[category.slug] ?? CookingPotIcon;
          return (
            <Card
              key={category.id}
              className="group overflow-hidden p-0 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <Link
                href={`/products?category=${category.slug}`}
                className="flex h-full flex-col"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                  {imageByCategory[category.id] ? (
                    <Image
                      src={imageByCategory[category.id]}
                      alt={`Equipamiento para ${category.name.toLowerCase()}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 400px"
                      className="object-contain p-5 transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-secondary/15 to-primary/10 text-primary">
                      <Icon className="size-16 opacity-60" />
                    </div>
                  )}
                  <span className="absolute left-4 top-4 flex size-10 items-center justify-center rounded-full bg-card/95 text-primary shadow-sm">
                    <Icon className="size-5" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h3 className="text-lg font-bold tracking-tight">
                    {category.name}
                  </h3>
                  <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {category.description}
                  </p>
                  <span className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Ver equipos
                    <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
