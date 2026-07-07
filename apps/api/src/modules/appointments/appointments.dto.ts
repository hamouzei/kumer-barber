import { z } from "zod/v4";

export const createBookingDto = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z
    .string()
    .min(9, "Phone must be at least 9 characters")
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format"),
  appointment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  start_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  payment_amount: z.coerce.number().positive("Payment amount must be positive"),
  payment_proof: z.string().min(1, "Payment proof is required"),
});

export type CreateBookingDto = z.infer<typeof createBookingDto>;

export const updateAppointmentStatusDto = z.object({
  reason: z.string().max(500).optional(),
});

export type UpdateAppointmentStatusDto = z.infer<
  typeof updateAppointmentStatusDto
>;

export const appointmentQueryDto = z.object({
  status: z
    .enum(["pending", "approved", "rejected", "completed", "cancelled", "expired"])
    .optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type AppointmentQueryDto = z.infer<typeof appointmentQueryDto>;
