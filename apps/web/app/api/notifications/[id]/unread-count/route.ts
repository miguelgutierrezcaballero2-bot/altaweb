/**
 * Notifications [id]/unread-count API route — Get unread count
 */

import { NextRequest, NextResponse } from 'next/server';
import { notificationManager } from '@/lib/managers/notification-manager';

export async function GET(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await paramsPromise;
    const count = notificationManager.getUnreadCount(params.id);
    return NextResponse.json({ unreadCount: count });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch unread count' },
      { status: 500 }
    );
  }
}
