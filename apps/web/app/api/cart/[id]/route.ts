/**
 * Cart [id] API route — Next.js App Router
 */

import { NextRequest, NextResponse } from 'next/server';
import { cartManager } from '@/lib/managers/cart-manager';

export async function GET(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await paramsPromise;
    const cart = cartManager.findById(params.id);
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }
    return NextResponse.json({ cart });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await paramsPromise;
    const body = await request.json();
    const { action, ...actionData } = body;

    let cart;
    switch (action) {
      case 'addItem':
        cart = cartManager.addItem(params.id, actionData);
        break;
      case 'removeItem':
        cart = cartManager.removeItem(params.id, actionData.productId);
        break;
      case 'updateQuantity':
        cart = cartManager.updateItemQuantity(params.id, actionData.productId, actionData.quantity);
        break;
      case 'clear':
        cart = cartManager.clear(params.id);
        break;
      case 'applyDiscount':
        cart = cartManager.applyDiscount(params.id, actionData.code, actionData.amount);
        break;
      case 'calculateTotal':
        cart = cartManager.calculateTotal(params.id);
        break;
      default:
        cart = cartManager.findById(params.id);
    }

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }
    return NextResponse.json({ cart });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 400 }
    );
  }
}
