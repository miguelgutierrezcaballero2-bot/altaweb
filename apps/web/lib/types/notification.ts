/**
 * Notification — User notifications domain types
 */

export type NotificationType = 'order' | 'promotion' | 'system' | 'review';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: Date;
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown> | null;
}

export interface UpdateNotificationInput {
  isRead?: boolean;
}
