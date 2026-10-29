/**
 * Users API route — Next.js App Router
 */

import { NextRequest, NextResponse } from 'next/server';
import { userManager } from '@/lib/managers/user-manager';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (email) {
      const user = userManager.findByEmail(email);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      const { password: _, ...safeUser } = user;
      return NextResponse.json({ user: safeUser });
    }

    const users = userManager.findAll();
    const safeUsers = users.map(({ password: _, ...rest }) => rest);
    return NextResponse.json({ users: safeUsers });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = userManager.create(body);
    const { password: _, ...safeUser } = user;
    return NextResponse.json({ user: safeUser }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 400 }
    );
  }
}
