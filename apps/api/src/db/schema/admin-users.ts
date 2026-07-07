import {
  bigint,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const adminUsers = mysqlTable("admin_users", {
  adminId: bigint("admin_id", { mode: "number" })
    .primaryKey()
    .autoincrement(),
  email: varchar("email", { length: 100 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
