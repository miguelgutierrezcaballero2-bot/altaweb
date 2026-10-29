/**
 * Quote teaser (Fase 7) — honest B2B request-a-quote section.
 * The web quote form is Phase 9 work, so the CTA routes to the real,
 * existing channel (mailto ventas@altacocina.com); no dead /quote route.
 * `#cotizacion` is an in-page anchor target for future header CTAs.
 */

import { ClockIcon, MailIcon } from 'lucide-react';
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
              El formulario de cotización web está en preparación (fase 9);
              mientras tanto te atendemos por correo.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              nativeButton={false}
              render={<a href={`mailto:${QUOTE_EMAIL}`} />}
            >
              <MailIcon data-icon="inline-start" />
              Escribinos: {QUOTE_EMAIL}
            </Button>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ClockIcon className="size-3.5 text-primary" />
              Atención comercial: Lun a Vie, 9 a 18 h
            </span>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
