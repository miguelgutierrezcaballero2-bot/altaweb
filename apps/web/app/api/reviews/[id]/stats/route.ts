/**
 * Reviews [productId]/stats API route — Review statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { reviewManager } from '@/lib/managers/review-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const averageRating = reviewManager.getAverageRating(params.productId);
    const count = reviewManager.getCount(params.productId);
    return NextResponse.json({ averageRating, count });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch review stats' },
      { status: 500 }
    );
  }
}
