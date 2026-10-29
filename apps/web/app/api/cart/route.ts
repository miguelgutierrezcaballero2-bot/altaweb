/**
 * Cart API route — Next.js App Router
 */

import { NextRequest, NextResponse } from 'next/server';
import { cartManager } from '@/lib/managers/cart-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      const carts = cartManager.findByUser(userId);
      return NextResponse.json({ carts });
    }

    const carts = cartManager.findAll();
    return NextResponse.json({ carts });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch carts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cart = cartManager.create(body);
    return NextResponse.json({ cart }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create cart' },
      { status: 400 }
    );
  }
}
