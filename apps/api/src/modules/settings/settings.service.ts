import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { businessSettings } from "../../db/schema/index.js";
import { NotFoundError } from "../../shared/errors/app-error.js";
import type { UpdateSettingsDto } from "./settings.dto.js";

export async function getSettings() {
  const [settings] = await db.select().from(businessSettings).limit(1);

  if (!settings) {
    throw new NotFoundError("Business settings");
  }

  return settings;
}

function normalizeTime(time: string): string {
  if (/^\d{2}:\d{2}$/.test(time)) {
    return time + ":00";
  }
  return time;
}

export async function updateSettings(dto: UpdateSettingsDto) {
  const [existing] = await db.select().from(businessSettings).limit(1);

  if (!existing) {
    throw new NotFoundError("Business settings");
  }

  const updates: Partial<typeof businessSettings.$inferInsert> = {};

  if (dto.haircut_price !== undefined)
    updates.haircutPrice = String(dto.haircut_price);
  if (dto.deposit_amount !== undefined)
    updates.depositAmount = String(dto.deposit_amount);
  if (dto.duration_minutes !== undefined)
    updates.durationMinutes = dto.duration_minutes;
  if (dto.opening_time !== undefined)
    updates.openingTime = normalizeTime(dto.opening_time);
  if (dto.closing_time !== undefined)
    updates.closingTime = normalizeTime(dto.closing_time);
  if (dto.working_days !== undefined)
    updates.workingDays = dto.working_days;
  if (dto.payment_instructions !== undefined)
    updates.paymentInstructions = dto.payment_instructions;
  if (dto.cbe_account !== undefined)
    updates.cbeAccount = dto.cbe_account;
  if (dto.telebirr_account !== undefined)
    updates.telebirrAccount = dto.telebirr_account;
  if (dto.account_holder !== undefined)
    updates.accountHolder = dto.account_holder;
  if (dto.booking_policy !== undefined)
    updates.bookingPolicy = dto.booking_policy;
  if (dto.contact_phone !== undefined)
    updates.contactPhone = dto.contact_phone;
  if (dto.contact_email !== undefined)
    updates.contactEmail = dto.contact_email;
  if (dto.address !== undefined) updates.address = dto.address;
  if (dto.google_maps_url !== undefined)
    updates.googleMapsUrl = dto.google_maps_url;
  if (dto.social_links !== undefined)
    updates.socialLinks = dto.social_links;

  if (Object.keys(updates).length > 0) {
    await db
      .update(businessSettings)
      .set(updates)
      .where(eq(businessSettings.settingId, existing.settingId));
  }

  return { ...existing, ...updates };
}
