/**
 * Shipping API route — Next.js App Router
 */

import { NextRequest, NextResponse } from 'next/server';
import { shippingManager } from '@/lib/managers/shipping-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const carrier = searchParams.get('carrier');

    if (orderId) {
      const shipment = shippingManager.findByOrder(orderId);
      if (!shipment) {
        return NextResponse.json({ error: 'Shipping not found' }, { status: 404 });
      }
      return NextResponse.json({ shipping: shipment });
    }

    if (carrier) {
      const shipments = shippingManager.findByCarrier(carrier);
      return NextResponse.json({ shipments });
    }

    return NextResponse.json({ shipments: [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch shipping' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const shipping = shippingManager.create(body);
    return NextResponse.json({ shipping }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create shipping' },
      { status: 400 }
    );
  }
}
