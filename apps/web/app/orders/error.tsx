'use client';

/**
 * `/orders` segment error boundary — orders copy (es-ar).
 * Covers the orders list surfaces; confirmation detail failures of unknown
 * orders are handled by notFound(), this is for genuine render errors.
 */

import Link from 'next/link';
import { ChefHatIcon, RotateCcwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function OrdersError({
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
        No pudimos mostrar tus pedidos
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Algo falló al cargar el listado. Los pedidos registrados no se pierden:
        reintentá la vista o volvé al inicio.
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
