"use client";

/**
 * Checkout form — the storefront's order submission island.
 *
 * Owns the whole checkout interaction client-side by design:
 * - contact/business data with rhf + zod validation (es-AR copy),
 * - cart summary fed by the zustand store (single source of truth),
 * - promo validation via GET /api/promotions/[code]/validate,
 * - shipping estimation via GET /api/shipping/estimate,
 * - order creation via POST /api/orders with the exact CreateOrderInput shape.
 */

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  BadgeCheckIcon,
  CreditCardIcon,
  Loader2Icon,
  PackageIcon,
  ShoppingCartIcon,
  TagIcon,
  TruckIcon,
  XIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  selectSubtotal,
  selectTotalUnits,
  useCartStore,
} from '@/lib/store/cart-store';

/** Formats prices in es-AR pesos (client island copy). */
function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value);
}

/** Formats an ISO delivery estimate as a short es-AR date. */
function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(iso));
}

/** Server validation errors arrive in English; surface them in es-AR. */
function translatePromoError(error: string): string {
  const minPurchase = /^Minimum purchase of \$(\d+(\.\d+)?) required$/.exec(error);
  if (minPurchase) return `Compra mínima de $${Math.round(Number(minPurchase[1]))} requerida`;

  const known: Record<string, string> = {
    'Invalid promo code': 'El código ingresado no existe',
    'Promotion is not active': 'La promoción no está activa',
    'Promotion has expired': 'La promoción está vencida',
    'Promotion has reached max uses': 'La promoción agotó sus usos disponibles',
    'Promotion not applicable to this category': 'La promoción no aplica a este rubro',
  };
  return known[error] ?? 'No pudimos validar el código, probá de nuevo';
}

const checkoutSchema = z.object({
  businessName: z.string().trim().min(3, 'Ingresá la razón social del negocio'),
  contactName: z.string().trim().min(3, 'Ingresá la persona de contacto'),
  email: z.email('Ingresá un correo válido'),
  notes: z.string().trim().max(300, 'Máximo 300 caracteres'),
  street: z.string().trim().min(5, 'Ingresá calle y altura'),
  city: z.string().trim().min(3, 'Ingresá la localidad'),
  state: z.string().trim().min(3, 'Ingresá la provincia'),
  zip: z.string().trim().min(4, 'Ingresá un código postal válido'),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

/** One row of GET /api/shipping/estimate → estimates. */
interface ShippingEstimate {
  carrier: string;
  method: string;
  cost: number;
  estimatedDelivery: string;
}

/** Validated outcome of GET /api/promotions/[code]/validate → validation. */
interface PromoOutcome {
  code: string;
  isValid: boolean;
  discountAmount: number;
  error: string | null;
}

/** Country constant submitted with order addresses (B2B demo scope). */
const ORDER_COUNTRY = 'Argentina';

interface CheckoutFormProps {
  /** Demo vendor user id from the seed (Phase-5-auth scaffolding). */
  demoUserId: string | null;
  /** Seeded demo codes shown as a hint so the demo is exerciseable. */
  demoPromoCodes: readonly string[];
}

export function CheckoutForm({ demoUserId, demoPromoCodes }: CheckoutFormProps) {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = useCartStore(selectSubtotal);
  const totalUnits = useCartStore(selectTotalUnits);

  const [promoText, setPromoText] = useState('');
  const [promo, setPromo] = useState<PromoOutcome | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);

  const [estimates, setEstimates] = useState<ShippingEstimate[] | null>(null);
  const [selectedCarrier, setSelectedCarrier] = useState<string | null>(null);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [estimating, setEstimating] = useState(false);

  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      businessName: '',
      contactName: '',
      email: '',
      notes: '',
      street: '',
      city: '',
      state: '',
      zip: '',
    },
  });

  /* ── Promo validation ────────────────────────────────────── */

  const applyPromo = async () => {
    const code = promoText.trim();
    if (!code) {
      setPromoError('Ingresá un código para validar');
      return;
    }
    setValidatingPromo(true);
    setPromoError(null);
    try {
      const query = new URLSearchParams({ purchaseAmount: String(subtotal) });
      const res = await fetch(
        `/api/promotions/${encodeURIComponent(code)}/validate?${query}`,
      );
      const data = (await res.json()) as { validation?: PromoOutcome; error?: string };
      if (!res.ok || !data.validation) {
        setPromoError(data.error ?? 'No pudimos validar el código, probá de nuevo');
        setPromo(null);
        return;
      }
      if (!data.validation.isValid) {
        setPromo(null);
        setPromoError(data.validation.error ?? 'Código inválido');
        return;
      }
      setPromo({
        code,
        isValid: true,
        discountAmount: data.validation.discountAmount,
        error: null,
      });
    } catch {
      setPromoError('Error de conexión al validar el código');
    } finally {
      setValidatingPromo(false);
    }
  };

  const discardPromo = () => {
    setPromo(null);
    setPromoText('');
  };

  /* ── Shipping estimation ─────────────────────────────────── */

  const estimateShipping = async () => {
    const addressOk = await trigger(['street', 'city', 'state', 'zip']);
    if (!addressOk) {
      setShippingError('Completá la dirección para estimar el envío');
      return;
    }
    setEstimating(true);
    setShippingError(null);
    try {
      const query = new URLSearchParams({
        weight: String(totalUnits),
        method: 'Standard',
        country: ORDER_COUNTRY,
      });
      const res = await fetch(`/api/shipping/estimate?${query}`);
      const data = (await res.json()) as { estimates?: ShippingEstimate[]; error?: string };
      if (!res.ok || !data.estimates?.length) {
        setShippingError(data.error ?? 'No pudimos estimar el envío, probá de nuevo');
        return;
      }
      setEstimates(data.estimates);
      setSelectedCarrier(data.estimates[0]?.carrier ?? null);
    } catch {
      setShippingError('Error de conexión al estimar el envío');
    } finally {
      setEstimating(false);
    }
  };

  /* ── Submit ──────────────────────────────────────────────── */

  const selectedEstimate =
    estimates?.find((estimate) => estimate.carrier === selectedCarrier) ?? null;

  const discount = promo?.isValid ? promo.discountAmount : 0;
  const shippingCost = selectedEstimate?.cost ?? 0;
  const estimatedTotal = Math.max(subtotal - discount, 0) + shippingCost;

  const onSubmit = async (values: CheckoutValues) => {
    setSubmitError(null);
    if (!demoUserId) {
      setSubmitError('Falta la cuenta demo para registrar el pedido (scaffolding de fase 5)');
      return;
    }

    const address = {
      street: values.street.trim(),
      city: values.city.trim(),
      state: values.state.trim(),
      zip: values.zip.trim(),
      country: ORDER_COUNTRY,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: demoUserId,
          items: items.map(({ productId, name, price, image, qty }) => ({
            productId,
            name,
            price,
            quantity: qty,
            image,
          })),
          paymentMethod: 'transferencia',
          shippingAddress: address,
          billingAddress: address,
        }),
      });

      const data = (await res.json()) as { order?: { id: string }; error?: string };
      if (!res.ok || !data.order) {
        setSubmitError(
          data.error ?? `No pudimos registrar el pedido (HTTP ${res.status}). Reintentá.`,
        );
        return;
      }

      // Order accepted: empty the local cart, then navigate to confirmation.
      clearCart();
      router.push(`/orders/${data.order.id}`);
    } catch {
      setSubmitError('Error de conexión al registrar el pedido');
    }
  };

  /* ── Empty cart state ────────────────────────────────────── */

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <ShoppingCartIcon className="size-6" />
          </span>
          <p className="text-lg font-semibold">Tu carrito está vacío</p>
          <p className="text-sm text-muted-foreground">
            Agregá equipos desde el catálogo antes de finalizar la compra.
          </p>
          <Button nativeButton={false} render={<Link href="/products" />}>
            Ver catálogo
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <form
        id="checkout"
        className="space-y-6"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* Contact data */}
        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-lg font-semibold">Datos del negocio</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="businessName">Razón social</Label>
                <Input
                  id="businessName"
                  placeholder="Pollería Don Julián SRL"
                  autoComplete="organization"
                  {...register('businessName')}
                />
                {errors.businessName && (
                  <p className="text-xs text-destructive">{errors.businessName.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contactName">Persona de contacto</Label>
                <Input
                  id="contactName"
                  placeholder="Julián Fernández"
                  autoComplete="name"
                  {...register('contactName')}
                />
                {errors.contactName && (
                  <p className="text-xs text-destructive">{errors.contactName.message}</p>
                )}
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="email">Correo de contacto</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="compras@negocios.com.ar"
                  autoComplete="email"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="notes">Notas para el pedido (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Horario de recepción, condiciones de entrega, req. factura A..."
                  {...register('notes')}
                />
                {errors.notes && (
                  <p className="text-xs text-destructive">{errors.notes.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping address + estimate */}
        <Card>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Dirección de envío</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={estimateShipping}
                disabled={estimating}
              >
                {estimating && <Loader2Icon className="animate-spin" />}
                <TruckIcon data-icon="inline-start" />
                Calcular envío
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="street">Calle y altura</Label>
                <Input
                  id="street"
                  placeholder="Av. Rivadavia 5432"
                  autoComplete="street-address"
                  {...register('street')}
                />
                {errors.street && (
                  <p className="text-xs text-destructive">{errors.street.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">Localidad</Label>
                <Input id="city" placeholder="Buenos Aires" {...register('city')} />
                {errors.city && (
                  <p className="text-xs text-destructive">{errors.city.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state">Provincia</Label>
                <Input id="state" placeholder="Buenos Aires" {...register('state')} />
                {errors.state && (
                  <p className="text-xs text-destructive">{errors.state.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="zip">Código postal</Label>
                <Input id="zip" placeholder="1424" autoComplete="postal-code" {...register('zip')} />
                {errors.zip && (
                  <p className="text-xs text-destructive">{errors.zip.message}</p>
                )}
              </div>
            </div>

            {shippingError && (
              <p className="text-sm text-destructive">{shippingError}</p>
            )}

            {estimates && (
              <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3">
                <p className="text-sm font-medium">Opciones de despacho</p>
                <div className="flex flex-wrap gap-2">
                  {estimates.map((estimate) => (
                    <Button
                      key={estimate.carrier}
                      type="button"
                      size="sm"
                      variant={selectedCarrier === estimate.carrier ? 'default' : 'outline'}
                      onClick={() => setSelectedCarrier(estimate.carrier)}
                    >
                      {estimate.carrier} · {formatPrice(estimate.cost)} · entrega{' '}
                      {formatDate(estimate.estimatedDelivery)}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <Card>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <CreditCardIcon className="size-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Pago por transferencia</h2>
              <Badge variant="outline">B2B</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Al confirmar el pedido te enviamos los datos de transferencia con el
              detalle final al correo de contacto.
            </p>
            {!demoUserId && (
              <p className="text-sm text-destructive">
                No hay cuenta demo disponible para asociar el pedido (scaffolding de fase
                5); el registro está deshabilitado.
              </p>
            )}
            {submitError && <p className="text-sm text-destructive">{submitError}</p>}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isSubmitting || !demoUserId}
            >
              {isSubmitting && <Loader2Icon className="animate-spin" />}
              Confirmar pedido
            </Button>
          </CardContent>
        </Card>
      </form>

      {/* Cart summary */}
      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <Card>
          <CardContent className="space-y-3">
            <h2 className="text-base font-semibold">Tu pedido ({totalUnits} unidades)</h2>
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.productId} className="flex items-start gap-2 text-sm">
                  <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground md:size-10">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt="" className="size-full object-cover" />
                    ) : (
                      <PackageIcon className="size-4" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{item.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.qty} × {formatPrice(item.price)}
                    </span>
                  </span>
                  <span className="font-medium">
                    {formatPrice(item.price * item.qty)}
                  </span>
                </li>
              ))}
            </ul>
            <Separator />
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-medium">{formatPrice(subtotal)}</dd>
              </div>
              {promo?.isValid && (
                <div className="flex items-center justify-between gap-4">
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    Descuento <Badge variant="secondary">{promo.code}</Badge>
                  </dt>
                  <dd className="font-medium text-primary">
                    −{formatPrice(promo.discountAmount)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Envío</dt>
                <dd className="font-medium">
                  {selectedEstimate ? formatPrice(selectedEstimate.cost) : 'a calcular'}
                </dd>
              </div>
              <Separator />
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-base font-semibold">Total estimado</dt>
                <dd className="text-lg font-bold text-primary">
                  {formatPrice(estimatedTotal)}
                </dd>
              </div>
            </dl>
            <p className="text-xs text-muted-foreground">
              El total facturado lo confirma el sector comercial con el detalle del
              pedido.
            </p>
          </CardContent>
        </Card>

        {/* Promo code */}
        <Card>
          <CardContent className="space-y-3">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <TagIcon className="size-4 text-muted-foreground" />
              Código de descuento
            </h2>
            {promo?.isValid ? (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 p-2.5 text-sm">
                <span className="flex items-center gap-1.5">
                  <BadgeCheckIcon className="size-4 text-primary" />
                  {promo.code} aplicado
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Quitar código de descuento"
                  onClick={discardPromo}
                >
                  <XIcon />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  aria-label="Código de descuento"
                  placeholder="BIENVENIDA10"
                  value={promoText}
                  onChange={(event) => setPromoText(event.target.value.toUpperCase())}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      void applyPromo();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void applyPromo()}
                  disabled={validatingPromo}
                >
                  {validatingPromo && <Loader2Icon className="animate-spin" />}
                  Validar
                </Button>
              </div>
            )}
            {promoError && <p className="text-sm text-destructive">{promoError}</p>}
            <p className="text-xs text-muted-foreground">
              Códigos de prueba: {demoPromoCodes.join(' · ')}
            </p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
