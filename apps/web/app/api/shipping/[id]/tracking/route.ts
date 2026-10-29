/**
 * Shipping [id]/tracking API route — Get tracking information
 */

import { NextRequest, NextResponse } from 'next/server';
import { shippingManager } from '@/lib/managers/shipping-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tracking = shippingManager.getTracking(params.id);
    if (!tracking) {
      return NextResponse.json({ error: 'Tracking not found' }, { status: 404 });
    }
    return NextResponse.json({ tracking });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tracking' },
      { status: 500 }
    );
  }
}
