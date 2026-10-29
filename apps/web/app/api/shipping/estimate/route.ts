/**
 * Shipping estimate API route — Estimate shipping cost
 */

import { NextRequest, NextResponse } from 'next/server';
import { shippingManager } from '@/lib/managers/shipping-manager';
import type { Address } from '@/lib/types/shipping';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weight = parseFloat(searchParams.get('weight') ?? '1');
    const method = searchParams.get('method') ?? 'Standard';
    const country = searchParams.get('country') ?? 'US';
    const state = searchParams.get('state') ?? '';
    const city = searchParams.get('city') ?? '';
    const zip = searchParams.get('zip') ?? '';
    const street = searchParams.get('street') ?? '';

    const address: Address = { street, city, state, zip, country };
    const estimates = shippingManager.estimateCost(address, weight, method);
    return NextResponse.json({ estimates });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to estimate shipping cost' },
      { status: 500 }
    );
  }
}
