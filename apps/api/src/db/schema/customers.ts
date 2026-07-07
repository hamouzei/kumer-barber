import {
  bigint,
  mysqlTable,
  timestamp,
  varchar,
  text,
} from "drizzle-orm/mysql-core";

export const customers = mysqlTable("customers", {
  customerId: bigint("customer_id", { mode: "number" })
    .primaryKey()
    .autoincrement(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).unique().notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
