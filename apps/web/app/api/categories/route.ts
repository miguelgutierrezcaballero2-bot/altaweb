/**
 * Categories API route — Next.js App Router
 */

import { NextRequest, NextResponse } from 'next/server';
import { categoryManager } from '@/lib/managers/category-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    const slug = searchParams.get('slug');

    if (slug) {
      const category = categoryManager.findBySlug(slug);
      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
      return NextResponse.json({ category });
    }

    if (parentId) {
      const categories = categoryManager.findByParent(parentId === 'null' ? null : parentId);
      return NextResponse.json({ categories });
    }

    const categories = categoryManager.findAll();
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const category = categoryManager.create(body);
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 400 }
    );
  }
}
