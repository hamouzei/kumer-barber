import { z } from "zod/v4";

export const updateContentDto = z.object({
  title: z.string().max(200).optional(),
  body: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type UpdateContentDto = z.infer<typeof updateContentDto>;
