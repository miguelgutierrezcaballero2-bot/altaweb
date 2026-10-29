/**
 * Shipping [id] API route — Next.js App Router
 */

import { NextRequest, NextResponse } from 'next/server';
import { shippingManager } from '@/lib/managers/shipping-manager';

export async function GET(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await paramsPromise;
    const shipping = shippingManager.findById(params.id);
    if (!shipping) {
      return NextResponse.json({ error: 'Shipping not found' }, { status: 404 });
    }
    return NextResponse.json({ shipping });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch shipping' },
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
    const shipping = shippingManager.updateStatus(params.id, body);
    if (!shipping) {
      return NextResponse.json({ error: 'Shipping not found' }, { status: 404 });
    }
    return NextResponse.json({ shipping });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update shipping' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await paramsPromise;
    const deleted = shippingManager.delete(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Shipping not found' }, { status: 404 });
    }
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete shipping' },
      { status: 500 }
    );
  }
}
