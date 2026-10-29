/**
 * Orders API route — Next.js App Router
 */

import { NextRequest, NextResponse } from 'next/server';
import { orderManager } from '@/lib/managers/order-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (userId) {
      const orders = orderManager.findByUser(userId);
      return NextResponse.json({ orders });
    }

    if (status) {
      const orders = orderManager.findByStatus(status as any);
      return NextResponse.json({ orders });
    }

    const orders = orderManager.findAll();
    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const order = orderManager.create(body);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 400 }
    );
  }
}
