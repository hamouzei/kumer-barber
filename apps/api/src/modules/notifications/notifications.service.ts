import { eq, desc, and, count } from "drizzle-orm";
import { db } from "../../db/client.js";
import { notifications } from "../../db/schema/index.js";

export async function getAdminNotifications() {
  const [items, unreadResult] = await Promise.all([
    db
      .select()
      .from(notifications)
      .where(eq(notifications.recipientType, "admin"))
      .orderBy(desc(notifications.createdAt))
      .limit(50),
    db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.recipientType, "admin"),
          eq(notifications.isRead, false)
        )
      ),
  ]);

  return {
    notifications: items,
    unreadCount: unreadResult[0]?.count ?? 0,
  };
}

export async function markAsRead(id: number): Promise<void> {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.notificationId, id));
}

export async function markAllAsRead(): Promise<void> {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.recipientType, "admin"),
        eq(notifications.isRead, false)
      )
    );
}

export async function getBookingNotifications(appointmentId: number) {
  return db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.appointmentId, appointmentId),
        eq(notifications.recipientType, "customer")
      )
    )
    .orderBy(desc(notifications.createdAt));
}
