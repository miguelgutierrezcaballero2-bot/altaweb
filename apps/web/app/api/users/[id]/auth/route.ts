/**
 * Users [id]/auth API route — Authentication endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/lib/managers/user-manager';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const result = userManager.authenticate(body);
    if (!result) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 400 }
    );
  }
}
