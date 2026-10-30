"use client";

/**
 * Quote request form (Fase 9) — the honest demo surface.
 *
 * NO backend contract exists for quotes, so submit NEVER calls an API:
 * it composes the request text client-side, shows it back to the user,
 * offers a copy-to-clipboard button and a pre-filled mailto, and a visible
 * notice stating that nothing is stored/sent by this site. The real quote
 * backend is a recorded domain follow-up.
 */

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CheckIcon,
  CopyIcon,
  MailIcon,
  ReceiptTextIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface QuoteCategory {
  slug: string;
  name: string;
}

const quoteSchema = z.object({
  empresa: z.string().min(2, 'Ingresá el nombre de la empresa'),
  contactName: z.string().min(2, 'Ingresá tu nombre y apellido'),
  contactEmail: z.email('Ingresá un correo válido'),
  /** Rubro is optional; value is a real category slug ('varios' = UI honesty). */
  category: z.string(),
  items: z.string(),
  notes: z.string(),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

const RUBRO_LABELS: Record<string, string> = {
  varios: 'Varios rubros',
};

/** The composed plain-text quote request (also the mailto body). */
function composeQuote(
  values: QuoteFormValues,
  categories: QuoteCategory[],
  quoteEmail: string,
): string {
  const rubroName =
    RUBRO_LABELS[values.category] ??
    categories.find((c) => c.slug === values.category)?.name ??
    'Sin especificar';
  const lines: string[] = [
    'Solicitud de cotización — AltaCocina',
    '',
    `Empresa: ${values.empresa}`,
    `Rubro: ${rubroName}`,
    `Contacto: ${values.contactName} (${values.contactEmail})`,
  ];
  if (values.items.trim()) {
    lines.push('Equipos de interés:');
    for (const line of values.items.split('\n')) {
      if (line.trim()) lines.push(`- ${line.trim()}`);
    }
  }
  if (values.notes.trim()) {
    lines.push(`Notas: ${values.notes.trim()}`);
  }
  lines.push('', `Cotizaciones B2B: ${quoteEmail} · Lun a Vie, 9 a 18 h`);
  return lines.join('\n');
}

interface QuoteRequestFormProps {
  categories: QuoteCategory[];
  prefill: {
    contactName: string;
    contactEmail: string;
    category: string;
    items: string;
  };
  quoteEmail: string;
}

export function QuoteRequestForm({
  categories,
  prefill,
  quoteEmail,
}: QuoteRequestFormProps) {
  const [composed, setComposed] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    mode: 'onBlur',
    defaultValues: {
      empresa: '',
      contactName: prefill.contactName,
      contactEmail: prefill.contactEmail,
      category: prefill.category,
      items: prefill.items,
      notes: '',
    },
  });

  const mailtoHref = useMemo(() => {
    if (!composed) return '';
    const subject = encodeURIComponent(
      `Solicitud de cotización — AltaCocina`,
    );
    return `mailto:${quoteEmail}?subject=${subject}&body=${encodeURIComponent(composed)}`;
  }, [composed, quoteEmail]);

  async function copyQuote() {
    if (!composed) return;
    try {
      await navigator.clipboard.writeText(composed);
      setCopied(true);
    } catch {
      // Clipboard denied (e.g. unsupported context): the text summary is
      // already selectable on screen, so the demo stays usable.
    }
  }

  return (
    <>
      {/* Honesty notice — the submit behavior says what it did and didn't. */}
      <p className="mt-4 rounded-lg border border-secondary/40 bg-secondary/10 px-3 py-2 text-xs text-muted-foreground">
        Sin cuenta y sin registro: al generar la solicitud se compone el
        texto acá mismo para que lo copies o lo envíes por tu correo. El
        sitio no guarda ni transmite datos por este formulario.
      </p>

      <form
        className="mt-6 space-y-5"
        onSubmit={handleSubmit((values: QuoteFormValues) => {
          setComposed(composeQuote(values, categories, quoteEmail));
          setCopied(false);
        })}
        noValidate
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="quoteEmpresa">Empresa</Label>
            <Input
              id="quoteEmpresa"
              placeholder="Pollería Don Julián SRL"
              autoComplete="organization"
              {...register('empresa')}
            />
            {errors.empresa && (
              <p className="text-xs text-destructive">{errors.empresa.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quoteName">Nombre de contacto</Label>
            <Input
              id="quoteName"
              placeholder="Julián Fernández"
              autoComplete="name"
              {...register('contactName')}
            />
            {errors.contactName && (
              <p className="text-xs text-destructive">
                {errors.contactName.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quoteEmail">Correo de contacto</Label>
            <Input
              id="quoteEmail"
              type="email"
              placeholder="compras@negocios.com.ar"
              autoComplete="email"
              {...register('contactEmail')}
            />
            {errors.contactEmail && (
              <p className="text-xs text-destructive">
                {errors.contactEmail.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="quoteCategory">Rubro (opcional)</Label>
            <select
              id="quoteCategory"
              className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              {...register('category')}
            >
              <option value="">Elegí un rubro…</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
              <option value="varios">Varios rubros</option>
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="quoteItems">Equipos de interés (opcional)</Label>
            <Textarea
              id="quoteItems"
              rows={4}
              placeholder="Horno pizzero 2 pisos, amasadora 30 L…"
              {...register('items')}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="quoteNotes">Volumen / notas (opcional)</Label>
            <Textarea
              id="quoteNotes"
              rows={3}
              placeholder="Apertura local, 3 sucursales, volumen de compra estimado…"
              {...register('notes')}
            />
          </div>
        </div>

        <Button type="submit">
          <ReceiptTextIcon data-icon="inline-start" />
          Generar solicitud
        </Button>
      </form>

      {composed && (
        <Card
          aria-label="Solicitud generada"
          className="mt-8 border-primary/30 bg-primary/5"
        >
          <CardContent className="space-y-4">
            <h2 className="text-lg font-bold tracking-tight">
              Solicitud generada
            </h2>
            <pre className="overflow-x-auto rounded-lg border border-border bg-card p-4 text-xs leading-relaxed whitespace-pre-wrap">
              {composed}
            </pre>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" onClick={copyQuote}>
                {copied ? (
                  <>
                    <CheckIcon data-icon="inline-start" />
                    Copiado
                  </>
                ) : (
                  <>
                    <CopyIcon data-icon="inline-start" />
                    Copiar solicitud
                  </>
                )}
              </Button>
              <Button size="sm" nativeButton={false} render={<a href={mailtoHref} />}>
                <MailIcon data-icon="inline-start" />
                Enviar por correo a {quoteEmail}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Demostración sin backend: esta solicitud no se guarda en el
              sistema; se la resolvemos por atención comercial cuando nos
              llega por correo. Cotización web con registro: dominio a
              definir (follow-up).
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
