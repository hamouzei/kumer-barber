import {
  bigint,
  int,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const gallery = mysqlTable("gallery", {
  imageId: bigint("image_id", { mode: "number" })
    .primaryKey()
    .autoincrement(),
  title: varchar("title", { length: 100 }),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  cloudinaryPublicId: varchar("cloudinary_public_id", {
    length: 255,
  }).notNull(),
  displayOrder: int("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
