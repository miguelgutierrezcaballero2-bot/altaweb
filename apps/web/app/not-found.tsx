/**
 * Global not-found — storefront-styled 404 (es-ar).
 * Rendered for `notFound()` calls and unmatched routes app-wide.
 */

import Link from 'next/link';
import { SearchXIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-secondary/15 text-secondary">
        <SearchXIcon className="size-7" />
      </span>
      <p className="mt-6 text-5xl font-black tracking-tight text-primary">404</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">
        Esta página no existe
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        No encontramos el contenido de esta dirección: puede que un equipo se haya
        retirado del catálogo o que el link esté desactualizado.
      </p>
      <Card className="mt-6 w-full">
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button nativeButton={false} render={<Link href="/" />}>
            Volver al inicio
          </Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/products" />}>
            Ver catálogo
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
