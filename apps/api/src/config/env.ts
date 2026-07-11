import { z } from "zod/v4";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),

  // Database (Aiven MySQL)
  DATABASE_URL: z.string().min(1).describe("MySQL connection string from Aiven"),

  // JWT (RS256)
  JWT_PRIVATE_KEY: z.string().min(1).describe("RSA private key (PEM format) for signing JWTs"),
  JWT_PUBLIC_KEY: z.string().min(1).describe("RSA public key (PEM format) for verifying JWTs"),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),

  // CORS
  FRONTEND_URL: z.string().default("http://localhost:3000"),

  // Seed (optional — only needed for initial admin setup)
  SEED_ADMIN_EMAIL: z.email().optional(),
  SEED_ADMIN_PASSWORD: z.string().min(8).optional(),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = z.prettifyError(result.error);
    console.error("❌ Invalid environment variables:\n", formatted);
    process.exit(1);
  }

  return result.data;
}

export const env = loadEnv();
