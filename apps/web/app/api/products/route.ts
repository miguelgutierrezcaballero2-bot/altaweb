/**
 * Products API route — Next.js App Router
 */

import { NextRequest, NextResponse } from 'next/server';
import { productManager } from '@/lib/managers/product-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');

    if (search) {
      const results = productManager.searchByName(search);
      return NextResponse.json({ products: results });
    }

    if (categoryId) {
      const results = productManager.findByCategory(categoryId);
      return NextResponse.json({ products: results });
    }

    const products = productManager.findAll();
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const product = productManager.create(body);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 400 }
    );
  }
}
