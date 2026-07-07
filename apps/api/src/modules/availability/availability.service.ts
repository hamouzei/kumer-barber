import { eq, and, inArray } from "drizzle-orm";
import { db } from "../../db/client.js";
import { appointments, businessSettings } from "../../db/schema/index.js";
import { NotFoundError } from "../../shared/errors/app-error.js";

interface TimeSlot {
  time: string;
}

function generateTimeSlots(
  openingTime: string,
  closingTime: string,
  durationMinutes: number
): string[] {
  const slots: string[] = [];
  const [openHour, openMin] = openingTime.split(":").map(Number);
  const [closeHour, closeMin] = closingTime.split(":").map(Number);

  if (openHour === undefined || openMin === undefined || closeHour === undefined || closeMin === undefined) {
    return slots;
  }

  let currentMinutes = openHour * 60 + openMin;
  const closingMinutes = closeHour * 60 + closeMin;

  while (currentMinutes + durationMinutes <= closingMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const mins = currentMinutes % 60;
    slots.push(
      `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`
    );
    currentMinutes += durationMinutes;
  }

  return slots;
}

export async function getAvailableDates(): Promise<string[]> {
  const [settings] = await db.select().from(businessSettings).limit(1);

  if (!settings) {
    throw new NotFoundError("Business settings");
  }

  const workingDays = settings.workingDays as number[];
  const today = new Date();
  const availableDates: string[] = [];

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayOfWeek = date.getDay();

    if (!workingDays.includes(dayOfWeek)) {
      continue;
    }

    const dateStr = date.toISOString().split("T")[0]!;

    const allSlots = generateTimeSlots(
      settings.openingTime,
      settings.closingTime,
      settings.durationMinutes
    );

    const bookedSlots = await db
      .select({ startTime: appointments.startTime })
      .from(appointments)
      .where(
        and(
          eq(appointments.appointmentDate, dateStr),
          inArray(appointments.status, ["pending", "approved"])
        )
      );

    const bookedTimes = new Set(
      bookedSlots.map((s) => s.startTime.slice(0, 5))
    );

    const freeSlots = allSlots.filter((slot) => !bookedTimes.has(slot));

    if (freeSlots.length > 0) {
      availableDates.push(dateStr);
    }
  }

  return availableDates;
}

export async function getAvailableSlots(
  date: string
): Promise<{ date: string; slots: TimeSlot[] }> {
  const [settings] = await db.select().from(businessSettings).limit(1);

  if (!settings) {
    throw new NotFoundError("Business settings");
  }

  const workingDays = settings.workingDays as number[];
  const targetDate = new Date(date + "T00:00:00");
  const dayOfWeek = targetDate.getDay();

  if (!workingDays.includes(dayOfWeek)) {
    return { date, slots: [] };
  }

  const allSlots = generateTimeSlots(
    settings.openingTime,
    settings.closingTime,
    settings.durationMinutes
  );

  const bookedSlots = await db
    .select({ startTime: appointments.startTime })
    .from(appointments)
    .where(
      and(
        eq(appointments.appointmentDate, date),
        inArray(appointments.status, ["pending", "approved"])
      )
    );

  const bookedTimes = new Set(
    bookedSlots.map((s) => s.startTime.slice(0, 5))
  );

  const freeSlots = allSlots
    .filter((slot) => !bookedTimes.has(slot))
    .map((time) => ({ time }));

  return { date, slots: freeSlots };
}

export async function getBusinessSettings() {
  const [settings] = await db.select().from(businessSettings).limit(1);

  if (!settings) {
    throw new NotFoundError("Business settings");
  }

  return settings;
}
