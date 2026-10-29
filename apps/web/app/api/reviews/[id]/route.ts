/**
 * Reviews [id] API route — Next.js App Router
 */

import { NextRequest, NextResponse } from 'next/server';
import { reviewManager } from '@/lib/managers/review-manager';

export async function GET(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await paramsPromise;
    const review = reviewManager.findAll().find((r) => r.id === params.id);
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }
    return NextResponse.json({ review });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch review' },
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
    const review = reviewManager.findAll().find((r) => r.id === params.id);
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (body.status === 'approved') {
      const updated = reviewManager.approve(params.id);
      return NextResponse.json({ review: updated });
    }

    if (body.status === 'rejected') {
      const updated = reviewManager.reject(params.id);
      return NextResponse.json({ review: updated });
    }

    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 400 }
    );
  }
}
