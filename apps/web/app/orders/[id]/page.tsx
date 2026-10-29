/**
 * `/orders/[id]` — order confirmation (RSC).
 *
 * Reads the order through its own HTTP contract (GET /api/orders/[id]) with
 * an own-origin fetch instead of touching the manager directly: order data
 * only exists after a POST /api/orders submission, and the API-backed read
 * avoids the dev render-worker singleton divergence found in Phase 3.
 * Shipping linkage is best-effort (GET /api/shipping?orderId=) — nothing in
 * the domain creates a shipment at order time, so the no-shipment state is
 * part of the contract, not an error.
 */

import Image from 'next/image';
import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { ArrowLeftIcon, MapPinIcon, PackageIcon, ReceiptTextIcon, TruckIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/components/catalog/product-card';
import { requireVerifiedSession } from '@/lib/auth/session';

/** HTTP-serialized Address as returned by the orders/shipping APIs. */
interface AddressView {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

/** HTTP-serialized Order as returned by GET /api/orders/[id]. */
interface OrderView {
  id: string;
  userId: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string | null;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  paymentMethod: string;
  shippingAddress: AddressView;
  billingAddress: AddressView;
  trackingNumber: string | null;
  createdAt: string;
}

/** HTTP-serialized Shipping as returned by GET /api/shipping?orderId=... */
interface ShippingView {
  orderId: string;
  carrier: string;
  trackingNumber: string;
  method: string;
  cost: number;
  estimatedDelivery: string;
  status: string;
}

/** es-AR labels for the OrderStatus enum values. */
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  processing: 'En preparación',
  shipped: 'Despachado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

interface OrderConfirmationPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderConfirmationPage({
  params,
}: OrderConfirmationPageProps) {
  const { id } = await params;

  // Gate (Phase 5): verified session or /login?next=/orders/<id>.
  await requireVerifiedSession(`/orders/${id}`);

  const headersList = await headers();
  const host = headersList.get('host') ?? 'localhost:3000';
  const protocol = host.startsWith('localhost') || host.startsWith('127.0.0.1')
    ? 'http'
    : 'https';
  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/orders/${id}`, { cache: 'no-store' });
  if (!res.ok) {
    notFound();
  }
  const { order } = (await res.json()) as { order: OrderView };
  if (!order) {
    notFound();
  }

  // Best-effort shipment linkage; 404 here means "no despacho registrado aún".
  let shipping: ShippingView | null = null;
  const shippingRes = await fetch(
    `${baseUrl}/api/shipping?orderId=${order.id}`,
    { cache: 'no-store' },
  );
  if (shippingRes.ok) {
    const data = (await shippingRes.json()) as { shipping?: ShippingView };
    shipping = data.shipping ?? null;
  }

  const statusLabel = STATUS_LABELS[order.status] ?? order.status;
  const placedAt = new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(order.createdAt));
  const eta = shipping
    ? new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' }).format(
        new Date(shipping.estimatedDelivery),
      )
    : null;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Pedido realizado el {placedAt}</p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Pedido confirmado</h1>
          <Badge
            variant={order.status === 'cancelled' ? 'destructive' : 'secondary'}
          >
            {statusLabel}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Nº de pedido <span className="font-medium text-foreground">{order.id}</span>
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          {/* Items */}
          <Card>
            <CardContent className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <ReceiptTextIcon className="size-5 text-muted-foreground" />
                Equipos del pedido ({order.items.reduce((sum, i) => sum + i.quantity, 0)}{' '}
                unidades)
              </h2>
              <ul className="space-y-3">
                {order.items.map((item) => (
                  <li key={item.productId} className="flex items-center gap-3 text-sm">
                    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={40}
                          height={40}
                          className="size-full object-cover"
                        />
                      ) : (
                        <PackageIcon className="size-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <Link
                        href={`/products/${item.productId}`}
                        className="block truncate font-medium hover:text-primary"
                      >
                        {item.name}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {item.quantity} × {formatPrice(item.price)}
                      </span>
                    </span>
                    <span className="font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <Separator />
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-medium">{formatPrice(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Impuestos internos (8%)</dt>
                  <dd className="font-medium">{formatPrice(order.tax)}</dd>
                </div>
                <Separator />
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-base font-semibold">Total</dt>
                  <dd className="text-lg font-bold text-primary">
                    {formatPrice(order.total)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Shipping / tracking */}
          <Card>
            <CardContent className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <TruckIcon className="size-5 text-muted-foreground" />
                Despacho y seguimiento
              </h2>
              {shipping ? (
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Transportista</dt>
                    <dd className="font-medium">{shipping.carrier}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Método</dt>
                    <dd className="font-medium">{shipping.method}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Seguimiento</dt>
                    <dd className="font-mono font-medium">{shipping.trackingNumber}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Entrega estimada</dt>
                    <dd className="font-medium">{eta}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aún sin datos de despacho: el sector comercial coordina el flete y
                  cargará el seguimiento en esta página.
                </p>
              )}
              {order.trackingNumber && !shipping && (
                <p className="text-sm">
                  Nº de seguimiento:{' '}
                  <span className="font-mono font-medium">{order.trackingNumber}</span>
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar facts */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardContent className="space-y-3">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <MapPinIcon className="size-4 text-muted-foreground" />
                Envío y facturación
              </h2>
              <address className="not-italic text-sm leading-relaxed text-muted-foreground">
                {order.shippingAddress.street}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state}
                <br />
                CP {order.shippingAddress.zip} · {order.shippingAddress.country}
              </address>
              <p className="text-xs text-muted-foreground">
                Facturación a la misma dirección · Pago: transferencia
                {order.paymentMethod !== 'transferencia' && ` (${order.paymentMethod})`}
              </p>
            </CardContent>
          </Card>

          <Button
            variant="outline"
            className="w-full"
            nativeButton={false}
            render={<Link href="/products" />}
          >
            <ArrowLeftIcon data-icon="inline-start" />
            Seguir comprando
          </Button>
        </aside>
      </div>
    </main>
  );
}
