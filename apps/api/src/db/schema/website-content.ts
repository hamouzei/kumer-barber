import {
  bigint,
  json,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const websiteContent = mysqlTable("website_content", {
  contentId: bigint("content_id", { mode: "number" })
    .primaryKey()
    .autoincrement(),
  sectionKey: varchar("section_key", { length: 50 }).unique().notNull(),
  title: varchar("title", { length: 200 }),
  body: text("body"),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});
