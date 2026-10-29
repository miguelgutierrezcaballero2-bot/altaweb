/**
 * Notifications [id]/mark-all API route — Mark all notifications as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { notificationManager } from '@/lib/managers/notification-manager';

export async function PUT(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await paramsPromise;
    const count = notificationManager.markAllAsRead(params.id);
    return NextResponse.json({ markedAsRead: count });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 400 }
    );
  }
}
