import { eq, asc } from "drizzle-orm";
import { db } from "../../db/client.js";
import { gallery } from "../../db/schema/index.js";
import { NotFoundError } from "../../shared/errors/app-error.js";
import * as uploadsService from "../uploads/uploads.service.js";
import type { UpdateGalleryImageDto } from "./gallery.dto.js";

export async function getAllImages() {
  return db
    .select()
    .from(gallery)
    .orderBy(asc(gallery.displayOrder));
}

export async function uploadImage(
  file: Express.Multer.File,
  title?: string
) {
  const uploaded = await uploadsService.uploadGalleryImage(file);

  const [maxOrder] = await db
    .select({ maxOrder: gallery.displayOrder })
    .from(gallery)
    .orderBy(asc(gallery.displayOrder))
    .limit(1);

  const nextOrder = (maxOrder?.maxOrder ?? -1) + 1;

  const [result] = await db.insert(gallery).values({
    title: title ?? null,
    imageUrl: uploaded.url,
    cloudinaryPublicId: uploaded.public_id,
    displayOrder: nextOrder,
  }).$returningId();

  return {
    image_id: result?.imageId,
    title,
    image_url: uploaded.url,
    display_order: nextOrder,
  };
}

export async function updateImage(
  id: number,
  dto: UpdateGalleryImageDto
) {
  const [existing] = await db
    .select()
    .from(gallery)
    .where(eq(gallery.imageId, id))
    .limit(1);

  if (!existing) {
    throw new NotFoundError("Gallery image", id);
  }

  const updates: Partial<typeof gallery.$inferInsert> = {};
  if (dto.title !== undefined) updates.title = dto.title;
  if (dto.display_order !== undefined) updates.displayOrder = dto.display_order;

  if (Object.keys(updates).length > 0) {
    await db.update(gallery).set(updates).where(eq(gallery.imageId, id));
  }

  return { ...existing, ...updates };
}

export async function deleteImage(id: number): Promise<void> {
  const [existing] = await db
    .select()
    .from(gallery)
    .where(eq(gallery.imageId, id))
    .limit(1);

  if (!existing) {
    throw new NotFoundError("Gallery image", id);
  }

  await uploadsService.deleteImage(existing.cloudinaryPublicId);
  await db.delete(gallery).where(eq(gallery.imageId, id));
}
