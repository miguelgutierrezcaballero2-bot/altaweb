/**
 * Promotions API route — Next.js App Router
 */

import { NextRequest, NextResponse } from 'next/server';
import { promotionManager } from '@/lib/managers/promotion-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
      const promotion = promotionManager.findByCode(code);
      if (!promotion) {
        return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
      }
      return NextResponse.json({ promotion });
    }

    const promotions = promotionManager.findAll();
    const active = promotionManager.getActivePromotions();
    return NextResponse.json({ promotions, activePromotions: active });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch promotions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const promotion = promotionManager.create(body);
    return NextResponse.json({ promotion }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create promotion' },
      { status: 400 }
    );
  }
}
