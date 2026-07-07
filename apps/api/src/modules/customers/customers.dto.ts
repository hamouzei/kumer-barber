import { z } from "zod/v4";

export const customerQueryDto = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CustomerQueryDto = z.infer<typeof customerQueryDto>;

export const updateCustomerDto = z.object({
  notes: z.string().max(1000).nullable().optional(),
});

export type UpdateCustomerDto = z.infer<typeof updateCustomerDto>;
