/**
 * Promotions [code]/validate API route — Validate promo code
 */

import { NextRequest, NextResponse } from 'next/server';
import { promotionManager } from '@/lib/managers/promotion-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const result = promotionManager.validateCode({
      code: params.code,
      categoryId: searchParams.get('categoryId') ?? undefined,
      purchaseAmount: searchParams.get('purchaseAmount')
        ? parseFloat(searchParams.get('purchaseAmount')!)
        : undefined,
    });
    return NextResponse.json({ validation: result });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to validate promotion' },
      { status: 400 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const promotion = promotionManager.applyDiscount(params.code);
    if (!promotion) {
      return NextResponse.json(
        { error: 'Failed to apply discount' },
        { status: 400 }
      );
    }
    return NextResponse.json({ promotion });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to apply discount' },
      { status: 400 }
    );
  }
}
