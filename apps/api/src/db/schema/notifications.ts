import {
  bigint,
  boolean,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { appointments } from "./appointments.js";

export const notificationTypeEnum = mysqlEnum("notification_type", [
  "new_booking",
  "booking_approved",
  "booking_rejected",
  "booking_completed",
  "booking_cancelled",
]);

export const notificationRecipientEnum = mysqlEnum("recipient_type", [
  "admin",
  "customer",
]);

export const notifications = mysqlTable("notifications", {
  notificationId: bigint("notification_id", { mode: "number" })
    .primaryKey()
    .autoincrement(),
  type: notificationTypeEnum.notNull(),
  appointmentId: bigint("appointment_id", { mode: "number" })
    .notNull()
    .references(() => appointments.appointmentId, { onDelete: "cascade" }),
  recipientType: notificationRecipientEnum.notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
