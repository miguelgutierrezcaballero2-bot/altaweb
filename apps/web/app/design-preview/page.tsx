import type { ReactNode } from "react";
import {
  Badge,
} from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const palette: { name: string; hex: string }[] = [
  { name: "background", hex: "#fbf6f0" },
  { name: "foreground", hex: "#3d2b1f" },
  { name: "primary", hex: "#c2540a" },
  { name: "primary-foreground", hex: "#fff8f1" },
  { name: "secondary", hex: "#8a5a33" },
  { name: "secondary-foreground", hex: "#fdf6ee" },
  { name: "muted", hex: "#f0e6d9" },
  { name: "muted-foreground", hex: "#806c55" },
  { name: "accent", hex: "#8b9270" },
  { name: "accent-foreground", hex: "#fdf6ee" },
  { name: "destructive", hex: "#b23b21" },
  { name: "destructive-foreground", hex: "#fff8f1" },
  { name: "border", hex: "#e7d8c5" },
  { name: "input", hex: "#e7d8c5" },
  { name: "ring", hex: "#c2540a" },
  { name: "card", hex: "#fffdf9" },
];

function Swatch({ name, hex }: { name: string; hex: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="h-16 w-full" style={{ backgroundColor: `var(--${name})` }} title={`--${name} = ${hex}`} />
      <div className="px-2.5 py-2">
        <p className="text-xs font-medium">--{name}</p>
        <p className="text-xs text-muted-foreground">{hex}</p>
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

export default function DesignPreviewPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl bg-background px-6 py-10 text-foreground">
      <header className="space-y-2">
        <Badge variant="secondary">AltaCocina · Fase 1</Badge>
        <h1 className="text-3xl font-bold tracking-tight">
          Design preview — warm gastronomic identity
        </h1>
        <p className="text-muted-foreground">
          Smoke page for the AltaCocina storefront foundation: Tailwind CSS v4
          tokens plus shadcn/ui primitives. All colors below come from the
          semantic token scale in <code>app/globals.css</code>.
        </p>
      </header>
      <Separator className="my-8" />

      <div className="space-y-12">
        <Section
          title="Palette"
          description="Semantic swatches rendered straight from the token variables."
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {palette.map((swatch) => (
              <Swatch key={swatch.name} name={swatch.name} hex={swatch.hex} />
            ))}
          </div>
        </Section>

        <Section
          title="Buttons"
          description="Every generated variant and size, driven by the terracotta primary and wood secondary."
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="xs">Extra small</Button>
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button variant="outline" disabled>
              Disabled
            </Button>
          </div>
        </Section>

        <Section
          title="Badges"
          description="Status marks for catalog states: new, offer, low stock, discontinued."
        >
          <div className="flex flex-wrap items-center gap-3">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="ghost">Ghost</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="link">Link</Badge>
          </div>
        </Section>

        <Section
          title="Card"
          description="The container primitive that catalog and vendor screens will build on."
        >
          <div className="max-w-sm">
            <Card>
              <CardHeader>
                <CardTitle>Freidora de pollo 20L</CardTitle>
                <CardDescription>
                  Equipo B2B para pollerías · capacidad dúplex
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Acero inoxidable 304, control termostático y cubeta de
                  recogida de grasa.
                </p>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
              <CardFooter className="justify-between">
                <span className="text-lg font-bold text-primary">$ 1.450.000</span>
                <Button size="sm">Agregar</Button>
              </CardFooter>
            </Card>
          </div>
        </Section>

        <Section
          title="Form controls"
          description="Input, textarea, label and select with token-driven borders and focus rings."
        >
          <div className="grid max-w-md gap-4">
            <div className="grid gap-2">
              <Label htmlFor="demo-email">Correo del vendedor</Label>
              <Input
                id="demo-email"
                type="email"
                placeholder="ventas@pollerialdorada.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="demo-notes">Notas del pedido</Label>
              <Textarea
                id="demo-notes"
                rows={3}
                placeholder="Entregar en la sucursal norte antes del viernes…"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="demo-category">Categoría</Label>
              <Select defaultValue="pollerias">
                <SelectTrigger id="demo-category" className="w-full">
                  <SelectValue placeholder="Elegí una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pollerias">Pollerías</SelectItem>
                  <SelectItem value="cafeterias">Cafeterías</SelectItem>
                  <SelectItem value="pizzerias">Pizzerías</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Section>

        <Section
          title="Tabs"
          description="Client-side switching used later by product detail sections."
        >
          <Tabs defaultValue="specs">
            <TabsList>
              <TabsTrigger value="specs">Especificaciones</TabsTrigger>
              <TabsTrigger value="shipping">Envío</TabsTrigger>
              <TabsTrigger value="reviews">Opiniones</TabsTrigger>
            </TabsList>
            <TabsContent value="specs" className="pt-2 text-sm text-muted-foreground">
              Potencia 12kW, 220V trifásico · medidas 80×70×95cm.
            </TabsContent>
            <TabsContent value="shipping" className="pt-2 text-sm text-muted-foreground">
              Flete calculado por zona · instalación incluida en CABA y GBA.
            </TabsContent>
            <TabsContent value="reviews" className="pt-2 text-sm text-muted-foreground">
              4.8 promedio sobre 37 valoraciones verificadas.
            </TabsContent>
          </Tabs>
        </Section>
      </div>

      <Separator className="my-10" />
      <footer className="text-xs text-muted-foreground">
        Legacy LUXE tokens remain in globals.css only for the starter demo at
        the root route; build new UI exclusively on the semantic scale above.
      </footer>
    </main>
  );
}
