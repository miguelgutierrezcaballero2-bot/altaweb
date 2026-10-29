/**
 * Reviews [id]/stats API route — Review statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { reviewManager } from '@/lib/managers/review-manager';

export async function GET(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await paramsPromise;
    const averageRating = reviewManager.getAverageRating(params.id);
    const count = reviewManager.getCount(params.id);
    return NextResponse.json({ averageRating, count });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch review stats' },
      { status: 500 }
    );
  }
}
