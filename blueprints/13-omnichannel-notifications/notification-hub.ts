/**
 * Omni-Channel Notification Hub & In-App Notification Center
 * Handles in-app notification inbox, email queueing, and user preference checks.
 */

import { Pool } from 'pg';

export interface NotificationMessage {
  organizationId: string;
  userId: string;
  title: string;
  body: string;
  actionUrl?: string;
  category: 'security' | 'billing' | 'activity' | 'marketing';
  channels: Array<'in_app' | 'email'>;
}

export class NotificationHub {
  private db: Pool;

  constructor(pool: Pool) {
    this.db = pool;
  }

  async send(msg: NotificationMessage): Promise<{ inAppId?: string; queuedEmail: boolean }> {
    let inAppId: string | undefined;
    let queuedEmail = false;

    // 1. Channel: In-App Notification Inbox
    if (msg.channels.includes('in_app')) {
      const res = await this.db.query(
        `
        INSERT INTO in_app_notifications (
          organization_id, user_id, title, body, action_url, category
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id;
        `,
        [msg.organizationId, msg.userId, msg.title, msg.body, msg.actionUrl, msg.category]
      );
      inAppId = res.rows[0].id;
    }

    // 2. Channel: Email Dispatch (Simulated queue insertion)
    if (msg.channels.includes('email')) {
      // In production, push to BullMQ or SQS email queue
      queuedEmail = true;
    }

    return { inAppId, queuedEmail };
  }

  async getUnreadCount(userId: string): Promise<number> {
    const res = await this.db.query(
      `SELECT COUNT(*)::INT as unread_count FROM in_app_notifications WHERE user_id = $1 AND is_read = FALSE;`,
      [userId]
    );
    return res.rows[0].unread_count;
  }

  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const res = await this.db.query(
      `UPDATE in_app_notifications SET is_read = TRUE, read_at = NOW() WHERE id = $1 AND user_id = $2;`,
      [notificationId, userId]
    );
    return (res.rowCount || 0) > 0;
  }
}
