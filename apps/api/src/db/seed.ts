import argon2 from "argon2";
import { db, pool } from "./client.js";
import { adminUsers, businessSettings, websiteContent } from "./schema/index.js";
import { env } from "../config/env.js";
import { logger } from "../shared/logger.js";
import { sql } from "drizzle-orm";

async function seed(): Promise<void> {
  logger.info("Starting database seed...");

  // Seed admin user
  if (env.SEED_ADMIN_EMAIL && env.SEED_ADMIN_PASSWORD) {
    const passwordHash = await argon2.hash(env.SEED_ADMIN_PASSWORD, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    await db
      .insert(adminUsers)
      .values({
        email: env.SEED_ADMIN_EMAIL,
        passwordHash,
      })
      .onDuplicateKeyUpdate({
        set: {
          email: env.SEED_ADMIN_EMAIL,
          passwordHash,
        },
      });

    logger.info(`Admin user seeded: ${env.SEED_ADMIN_EMAIL}`);
  } else {
    logger.warn(
      "SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD not set — skipping admin seed"
    );
  }

  // Seed default business settings
  await db
    .insert(businessSettings)
    .values({
      settingId: 1,
      haircutPrice: "500.00",
      depositAmount: "250.00",
      durationMinutes: 60,
      openingTime: "09:00:00",
      closingTime: "18:00:00",
      workingDays: [1, 2, 3, 4, 5, 6],
      paymentInstructions:
        "Please transfer the deposit amount to complete your booking.",
      contactPhone: "",
      contactEmail: "",
      address: "",
      socialLinks: {},
    })
    .onDuplicateKeyUpdate({
      set: { settingId: sql`setting_id` },
    });

  logger.info("Business settings seeded");

  // Seed default website content
  const sections = [
    {
      sectionKey: "hero",
      title: "Professional Barber",
      body: "Look Sharp Every Time",
      metadata: {
        subtitle: "Premium grooming experience",
        ctaText: "Book Now",
      },
    },
    {
      sectionKey: "about",
      title: "About Us",
      body: "Welcome to our barber shop. We provide professional haircut services with years of experience.",
      metadata: {
        mission: "To provide the best grooming experience.",
        experience: "",
        story: "",
      },
    },
    {
      sectionKey: "team",
      title: "Meet the Barber",
      body: "",
      metadata: {
        name: "",
        photo: "",
        experience: "",
        specialties: "",
      },
    },
  ];

  for (const section of sections) {
    await db
      .insert(websiteContent)
      .values(section)
      .onDuplicateKeyUpdate({
        set: { sectionKey: sql`section_key` },
      });
  }

  logger.info("Website content seeded");
  logger.info("Seed completed successfully");

  await pool.end();
  process.exit(0);
}

seed().catch((error: unknown) => {
  logger.error(error, "Seed failed");
  pool.end().finally(() => process.exit(1));
});
