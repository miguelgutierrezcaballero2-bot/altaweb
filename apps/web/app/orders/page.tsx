/**
 * `/orders` — order list (RSC), gated (Phase 5).
 *
 * Semantics per the route declaration: an admin sees all recent orders
 * (`GET /api/orders`), any other authenticated role sees their own
 * (`GET /api/orders?userId=<session userId>`). All reads go through the
 * orders HTTP contract with an own-origin fetch (dev module-graph safe).
 */

import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { ArrowLeftCircleIcon, PackageSearchIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { requireVerifiedSession } from '@/lib/auth/session';

/** HTTP-serialized Order as returned by the orders API. */
interface OrderRow {
  id: string;
  userId: string;
  items: { productId: string; quantity: number }[];
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  createdAt: string;
}

/** es-AR labels for OrderStatus values (parity with the detail page). */
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  processing: 'En preparación',
  shipped: 'Despachado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

function formatArs(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function OrdersPage() {
  // Gate first: anonymous users are redirected to /login?next=/orders.
  const session = await requireVerifiedSession('/orders');

  const headersList = await headers();
  const host = headersList.get('host') ?? 'localhost:3000';
  const protocol =
    host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  // Admin sees everything; any other role is scoped to their own orders
  // through the same contract (server-side userId filter).
  const isAdmin = session.role === 'admin';
  const res = await fetch(
    isAdmin
      ? `${baseUrl}/api/orders`
      : `${baseUrl}/api/orders?userId=${encodeURIComponent(session.userId)}`,
    { cache: 'no-store' },
  );
  if (!res.ok && res.status !== 404) {
    notFound();
  }
  const data = (await res.json()) as { orders?: OrderRow[] };
  const orders = (data.orders ?? []).toSorted(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
        <p className="text-muted-foreground">
          {isAdmin
            ? 'Últimos pedidos registrados en el mostrador.'
            : 'Pedidos registrados a tu nombre.'}
        </p>
      </header>

      {orders.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <PackageSearchIcon className="size-6" />
            </span>
            <p className="text-lg font-semibold">Todavía no hay pedidos</p>
            <p className="text-sm text-muted-foreground">
              {isAdmin
                ? 'Cuando se registre el primer pedido va a aparecer acá.'
                : 'Cuando finalices una compra el pedido va a aparecer acá.'}
            </p>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/products" />}
            >
              Ir al catálogo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-8 overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3">Pedido</th>
                <th scope="col" className="px-4 py-3">Fecha</th>
                <th scope="col" className="hidden px-4 py-3 sm:table-cell">Equipos</th>
                <th scope="col" className="px-4 py-3">Estado</th>
                <th scope="col" className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-mono text-xs font-medium hover:text-primary"
                    >
                      {order.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}{' '}
                    {order.items.reduce((sum, item) => sum + item.quantity, 0) === 1
                      ? 'unidad'
                      : 'unidades'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={order.status === 'cancelled' ? 'destructive' : 'secondary'}
                    >
                      {STATUS_LABELS[order.status] ?? order.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatArs(order.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <div className="mt-6">
        <Button
          variant="ghost"
          nativeButton={false}
          render={<Link href="/checkout" />}
        >
          <ArrowLeftCircleIcon data-icon="inline-start" />
          Tomar un pedido nuevo
        </Button>
      </div>
    </main>
  );
}
