/**
 * Inventory API route — Next.js App Router
 */

import { NextRequest, NextResponse } from 'next/server';
import { inventoryManager } from '@/lib/managers/inventory-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const warehouseId = searchParams.get('warehouseId');

    if (productId) {
      const items = inventoryManager.findByProduct(productId);
      return NextResponse.json({ inventory: items });
    }

    if (warehouseId) {
      const items = inventoryManager.findByWarehouse(warehouseId);
      return NextResponse.json({ inventory: items });
    }

    const items = inventoryManager.findAll();
    return NextResponse.json({ inventory: items });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const item = inventoryManager.create(body);
    return NextResponse.json({ inventory: item }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create inventory record' },
      { status: 400 }
    );
  }
}
