/**
 * Temporary storefront home (Phase 2).
 * Warm hero placeholder built exclusively with the design tokens and
 * shadcn/ui primitives; the real catalog home is Phase 3.
 */

import Link from 'next/link';
import {
  CoffeeIcon,
  CookingPotIcon,
  FlameIcon,
  PizzaIcon,
  ShieldCheckIcon,
  TruckIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const VERTICALS = [
  {
    icon: FlameIcon,
    title: 'Pollerías',
    description: 'Spiderventas, freidoras dúplex, vitrinas térmicas y accesorios de atención.',
  },
  {
    icon: CoffeeIcon,
    title: 'Cafeterías',
    description: 'Molinos de café, máquinas espresso, puffs térmicos y vajilla profesional.',
  },
  {
    icon: PizzaIcon,
    title: 'Pizzerías',
    description: 'Hornos pizzeros, amasadoras, estufas de piedra y paletas de trabajo.',
  },
];

const TRUST_POINTS = [
  { icon: TruckIcon, label: 'Flete e instalación en todo el país' },
  { icon: ShieldCheckIcon, label: 'Garantía oficial y repuestos' },
  { icon: CookingPotIcon, label: 'Equipos de uso intensivo, nivel gastronomía' },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
      <section className="mx-auto max-w-3xl space-y-5 text-center">
        <Badge variant="secondary" className="text-sm">
          Ventas mayoristas B2B
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          Equipamiento gastronómico para tu negocio
        </h1>
        <p className="text-lg text-muted-foreground text-pretty">
          Armá y equipá pollerías, cafeterías y pizzerías con maquinaria de uso
          intensivo: freidoras, hornos, café y refrigeración comercial, con
          asesoramiento y garantía oficial.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" render={<Link href="/products" />}>
            Ver catálogo
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/design-preview" />}>
            Preview del sistema de diseño
          </Button>
        </div>
      </section>

      <section
        aria-label="Rubros atendidos"
        className="mx-auto mt-14 grid gap-4 sm:grid-cols-3"
      >
        {VERTICALS.map((vertical) => (
          <Card key={vertical.title} className="gap-4">
            <CardHeader>
              <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <vertical.icon className="size-5" />
              </span>
              <CardTitle className="text-lg">{vertical.title}</CardTitle>
              <CardDescription>{vertical.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="link"
                size="sm"
                className="px-0"
                render={<Link href="/products" />}
              >
                Ver catálogo de {vertical.title.toLowerCase()}
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section
        aria-label="Beneficios de comprar en AltaCocina"
        className="mx-auto mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-border pt-8 text-sm text-muted-foreground"
      >
        {TRUST_POINTS.map((point) => (
          <span key={point.label} className="flex items-center gap-2">
            <point.icon className="size-4 text-primary" />
            {point.label}
          </span>
        ))}
      </section>
    </main>
  );
}
