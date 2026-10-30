/**
 * Quote teaser (Fase 7, CTA updated Fase 9) — honest B2B request-a-quote
 * section. With the real quote surface shipped (Fase 9), the CTA routes to
 * /quote and the mailto lives as a contact hint, not a fake submit.
 */

import Link from 'next/link';
import { ClockIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const QUOTE_EMAIL = 'ventas@altacocina.com';

export function QuoteTeaser() {
  return (
    <section
      id="cotizacion"
      aria-label="Cotizaciones B2B"
      className="scroll-mt-40"
    >
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Cotizaciones B2B por rubro
            </h2>
            <p className="text-sm text-muted-foreground">
              Armamos presupuestos a medida para pollerías, cafeterías y
              pizzerías: recomendación de equipos, flete e instalación.
              Contanos qué estás montando y te respondemos en el día.
            </p>
            <p className="text-xs text-muted-foreground">
              Formulario web disponible: generás la solicitud en el momento
              y la resolvemos por atención comercial.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2">
            <Button
              nativeButton={false}
              render={<Link href="/quote" />}
            >
              Solicitar cotización
            </Button>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ClockIcon className="size-3.5 text-primary" />
              Atención comercial: Lun a Vie, 9 a 18 h · {QUOTE_EMAIL}
            </span>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
