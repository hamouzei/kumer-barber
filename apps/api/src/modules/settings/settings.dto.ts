import { z } from "zod/v4";

export const updateSettingsDto = z.object({
  haircut_price: z.coerce.number().positive().optional(),
  deposit_amount: z.coerce.number().min(0).optional(),
  duration_minutes: z.coerce.number().int().positive().optional(),
  opening_time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Time must be in HH:MM format")
    .optional(),
  closing_time: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Time must be in HH:MM format")
    .optional(),
  working_days: z
    .array(z.number().int().min(0).max(6))
    .min(1, "At least one working day is required")
    .optional(),
  payment_instructions: z.string().optional(),
  contact_phone: z.string().max(20).optional(),
  contact_email: z.string().max(100).optional(),
  address: z.string().optional(),
  social_links: z.record(z.string(), z.string()).optional(),
});

export type UpdateSettingsDto = z.infer<typeof updateSettingsDto>;
