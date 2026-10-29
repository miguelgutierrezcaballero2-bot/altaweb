/**
 * Notifications [userId]/unread-count API route — Get unread count
 */

import { NextRequest, NextResponse } from 'next/server';
import { notificationManager } from '@/lib/managers/notification-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const count = notificationManager.getUnreadCount(params.userId);
    return NextResponse.json({ unreadCount: count });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch unread count' },
      { status: 500 }
    );
  }
}
