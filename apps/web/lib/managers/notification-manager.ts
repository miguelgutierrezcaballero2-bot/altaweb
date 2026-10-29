/**
 * NotificationManager — Singleton in-memory CRUD for Notification entities
 */

import type { Notification, CreateNotificationInput } from '../types/notification';

class NotificationManager {
  private static instance: NotificationManager;
  private notifications: Map<string, Notification> = new Map();

  private constructor() {}

  /** Get the singleton instance */
  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  /** Create a new notification */
  public create(input: CreateNotificationInput): Notification {
    const now = new Date();
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      metadata: input.metadata ?? null,
      isRead: false,
      createdAt: now,
    };
    this.notifications.set(notification.id, notification);
    return notification;
  }

  /** Find a notification by ID */
  public findById(id: string): Notification | undefined {
    return this.notifications.get(id);
  }

  /** Get all notifications */
  public findAll(): Notification[] {
    return Array.from(this.notifications.values());
  }

  /** Update a notification by ID */
  public update(id: string, input: Partial<Notification>): Notification | undefined {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    const updated: Notification = { ...notification, ...input };
    this.notifications.set(id, updated);
    return updated;
  }

  /** Delete a notification by ID */
  public delete(id: string): boolean {
    return this.notifications.delete(id);
  }

  /** Find notifications by user ID */
  public findByUser(userId: string): Notification[] {
    return Array.from(this.notifications.values()).filter((n) => n.userId === userId);
  }

  /** Mark a notification as read */
  public markAsRead(id: string): Notification | undefined {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;

    const updated: Notification = {
      ...notification,
      isRead: true,
    };
    this.notifications.set(id, updated);
    return updated;
  }

  /** Mark all notifications for a user as read */
  public markAllAsRead(userId: string): number {
    let count = 0;
    const entries = Array.from(this.notifications.entries());
    for (const [id, notification] of entries) {
      if (notification.userId === userId && !notification.isRead) {
        this.notifications.set(id, { ...notification, isRead: true });
        count++;
      }
    }
    return count;
  }

  /** Get unread notification count for a user */
  public getUnreadCount(userId: string): number {
    return Array.from(this.notifications.values()).filter(
      (n) => n.userId === userId && !n.isRead
    ).length;
  }
}

export const notificationManager = NotificationManager.getInstance();
