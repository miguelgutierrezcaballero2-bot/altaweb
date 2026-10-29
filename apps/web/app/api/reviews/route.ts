/**
 * Reviews API route — Next.js App Router
 */

import { NextRequest, NextResponse } from 'next/server';
import { reviewManager } from '@/lib/managers/review-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId');

    if (productId) {
      const reviews = reviewManager.findByProduct(productId);
      return NextResponse.json({ reviews });
    }

    if (userId) {
      const reviews = reviewManager.findByUser(userId);
      return NextResponse.json({ reviews });
    }

    const reviews = reviewManager.findAll();
    return NextResponse.json({ reviews });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const review = reviewManager.create(body);
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 400 }
    );
  }
}
