'use client';

/**
 * Global error boundary — storefront-styled (es-ar).
 * Client component by Next contract; the retry CTA calls `reset()` to
 * re-render the failing segment without a full reload.
 */

import Link from 'next/link';
import { ChefHatIcon, RotateCcwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function GlobalError({
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
        Algo se quemó en la cocina
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Ocurrió un error inesperado y no pudimos cargar esta vista. Tus datos del
        carrito están a salvo; probá de nuevo o volvé al inicio.
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
