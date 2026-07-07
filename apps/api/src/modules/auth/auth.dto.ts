import { z } from "zod/v4";

export const loginDto = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginDto = z.infer<typeof loginDto>;
