import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { websiteContent } from "../../db/schema/index.js";
import { NotFoundError } from "../../shared/errors/app-error.js";
import type { UpdateContentDto } from "./website-content.dto.js";

export async function getPublicContent() {
  const sections = await db.select().from(websiteContent);

  const content: Record<string, unknown> = {};
  for (const section of sections) {
    content[section.sectionKey] = {
      title: section.title,
      body: section.body,
      ...((section.metadata as Record<string, unknown>) ?? {}),
    };
  }

  return content;
}

export async function getAllContent() {
  return db.select().from(websiteContent);
}

export async function updateSection(
  sectionKey: string,
  dto: UpdateContentDto
) {
  const [existing] = await db
    .select()
    .from(websiteContent)
    .where(eq(websiteContent.sectionKey, sectionKey))
    .limit(1);

  if (!existing) {
    throw new NotFoundError("Content section", sectionKey);
  }

  const updates: Partial<typeof websiteContent.$inferInsert> = {};
  if (dto.title !== undefined) updates.title = dto.title;
  if (dto.body !== undefined) updates.body = dto.body;
  if (dto.metadata !== undefined) updates.metadata = dto.metadata;

  await db
    .update(websiteContent)
    .set(updates)
    .where(eq(websiteContent.sectionKey, sectionKey));

  return { ...existing, ...updates };
}
