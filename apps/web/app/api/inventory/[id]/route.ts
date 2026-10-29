/**
 * Inventory [id] API route — Next.js App Router
 */

import { NextRequest, NextResponse } from 'next/server';
import { inventoryManager } from '@/lib/managers/inventory-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = inventoryManager.findById(params.id);
    if (!item) {
      return NextResponse.json({ error: 'Inventory record not found' }, { status: 404 });
    }
    return NextResponse.json({ inventory: item });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const item = inventoryManager.updateStock(params.id, body);
    if (!item) {
      return NextResponse.json({ error: 'Inventory record not found' }, { status: 404 });
    }
    return NextResponse.json({ inventory: item });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update inventory' },
      { status: 400 }
    );
  }
}
