import {
  decimal,
  int,
  json,
  mysqlTable,
  text,
  time,
  varchar,
} from "drizzle-orm/mysql-core";

export const businessSettings = mysqlTable("business_settings", {
  settingId: int("setting_id").primaryKey(),
  haircutPrice: decimal("haircut_price", { precision: 10, scale: 2 }).notNull(),
  depositAmount: decimal("deposit_amount", {
    precision: 10,
    scale: 2,
  }).notNull(),
  durationMinutes: int("duration_minutes").notNull().default(60),
  openingTime: time("opening_time").notNull(),
  closingTime: time("closing_time").notNull(),
  workingDays: json("working_days")
    .notNull()
    .$type<number[]>()
    .default([1, 2, 3, 4, 5, 6]),
  paymentInstructions: text("payment_instructions"),
  cbeAccount: varchar("cbe_account", { length: 50 }),
  telebirrAccount: varchar("telebirr_account", { length: 50 }),
  accountHolder: varchar("account_holder", { length: 100 }),
  bookingPolicy: text("booking_policy"),
  contactPhone: varchar("contact_phone", { length: 20 }),
  contactEmail: varchar("contact_email", { length: 100 }),
  address: text("address"),
  googleMapsUrl: text("google_maps_url"),
  socialLinks: json("social_links")
    .$type<Record<string, string>>()
    .default({}),
});
