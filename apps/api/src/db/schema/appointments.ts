import {
  bigint,
  date,
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  time,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { customers } from "./customers.js";

export const appointmentStatusEnum = mysqlEnum("status", [
  "pending",
  "approved",
  "rejected",
  "completed",
  "cancelled",
  "expired",
]);

export const appointments = mysqlTable(
  "appointments",
  {
    appointmentId: bigint("appointment_id", { mode: "number" })
      .primaryKey()
      .autoincrement(),
    customerId: bigint("customer_id", { mode: "number" })
      .notNull()
      .references(() => customers.customerId, { onDelete: "restrict" }),
    appointmentDate: date("appointment_date", { mode: "string" }).notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    status: appointmentStatusEnum.notNull().default("pending"),
    paymentAmount: decimal("payment_amount", {
      precision: 10,
      scale: 2,
    }).notNull(),
    paymentProof: varchar("payment_proof", { length: 500 }),
    rejectionReason: varchar("rejection_reason", { length: 500 }),
    version: int("version").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("idx_appointments_date_time").on(
      table.appointmentDate,
      table.startTime
    ),
    index("idx_appointments_status").on(table.status),
    index("idx_appointments_customer").on(table.customerId),
  ]
);
