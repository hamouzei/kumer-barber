import { z } from "zod/v4";

export const updateGalleryImageDto = z.object({
  title: z.string().max(100).nullable().optional(),
  display_order: z.coerce.number().int().min(0).optional(),
});

export type UpdateGalleryImageDto = z.infer<typeof updateGalleryImageDto>;
