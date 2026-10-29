'use client';

/**
 * `/products` segment error boundary — catalog copy (es-ar).
 * Client component; catalog browsing has its own failure surface so the
 * message speaks about equipment lists, not the whole storefront.
 */

import Link from 'next/link';
import { ChefHatIcon, RotateCcwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <ChefHatIcon className="size-7" />
      </span>
      <h1 className="mt-6 text-2xl font-bold tracking-tight">
        No pudimos cargar el catálogo
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Algo falló al traer los equipos de esta sección. Probá de nuevo; si el
        problema sigue, el link directo al rubro es la salida.
      </p>
      {error.digest && (
        <p className="mt-1 text-xs text-muted-foreground/70">
          Código de seguimiento: <span className="font-mono">{error.digest}</span>
        </p>
      )}
      <Card className="mt-6 w-full">
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset}>
            <RotateCcwIcon data-icon="inline-start" />
            Reintentar
          </Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
            Volver al inicio
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
