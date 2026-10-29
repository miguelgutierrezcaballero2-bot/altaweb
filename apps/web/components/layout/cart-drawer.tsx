"use client";

/**
 * Cart drawer — the storefront's one heavy client island.
 * Uses the generated sheet primitive driven entirely by the zustand cart
 * store; the header trigger and the drawer share the same store so either
 * can open/close it.
 */

import Link from 'next/link';
import {
  MinusIcon,
  PackageIcon,
  PlusIcon,
  ShoppingCartIcon,
  Trash2Icon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  selectSubtotal,
  selectTotalUnits,
  useCartStore,
} from '@/lib/store/cart-store';

/** Formats prices in es-AR pesos for the B2B storefront. */
function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value);
}

/** Header trigger: cart icon with a unit-count badge; opens the drawer. */
export function CartButton() {
  const openCart = useCartStore((state) => state.openCart);
  const totalUnits = useCartStore(selectTotalUnits);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={openCart}
      aria-label={`Abrir carrito, ${totalUnits} unidades`}
      className="relative"
    >
      <ShoppingCartIcon />
      {totalUnits > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-[10px] font-bold text-primary-foreground">
          {totalUnits}
        </span>
      )}
    </Button>
  );
}

export function CartDrawer() {
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const items = useCartStore((state) => state.items);
  const incrementQty = useCartStore((state) => state.incrementQty);
  const decrementQty = useCartStore((state) => state.decrementQty);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = useCartStore(selectSubtotal);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? undefined : closeCart())}>
      <SheetContent side="right" className="flex w-full flex-col gap-0">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Tu carrito</SheetTitle>
          <SheetDescription>
            Equipos y herramientas para tu negocio
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ShoppingCartIcon className="size-6" />
            </span>
            <p className="font-medium">Tu carrito está vacío</p>
            <p className="text-sm text-muted-foreground">
              Agregá equipos desde el catálogo.
            </p>
            <Button variant="outline" render={<Link href="/products" />}>
              Ver catálogo
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center gap-3 p-4">
                  <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      <PackageIcon className="size-5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.price)}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="icon-xs"
                        aria-label={`Quitar una unidad de ${item.name}`}
                        onClick={() => decrementQty(item.productId)}
                      >
                        <MinusIcon />
                      </Button>
                      <span className="min-w-6 text-center text-sm font-medium">
                        {item.qty}
                      </span>
                      <Button
                        variant="outline"
                        size="icon-xs"
                        aria-label={`Agregar una unidad de ${item.name}`}
                        onClick={() => incrementQty(item.productId)}
                      >
                        <PlusIcon />
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Eliminar ${item.name} del carrito`}
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2Icon />
                  </Button>
                </li>
              ))}
            </ul>

            <SheetFooter className="border-t border-border bg-muted/40">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-base font-bold">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <Button
                render={<Link href="/products" />}
                onClick={closeCart}
              >
                Continuar compra
              </Button>
              <Button variant="ghost" onClick={clearCart}>
                Vaciar carrito
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
