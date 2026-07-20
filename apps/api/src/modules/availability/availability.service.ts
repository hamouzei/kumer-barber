import { and, gte, lte, inArray, sql } from "drizzle-orm";
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

function buildDateRange(workingDays: number[], daysAhead: number): string[] {
  const today = new Date();
  const dates: string[] = [];

  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    if (workingDays.includes(date.getDay())) {
      dates.push(date.toISOString().split("T")[0]!);
    }
  }

  return dates;
}

/**
 * Fetches available dates with a SINGLE database query instead of N queries.
 * Groups booked slots by date and filters against the total slot count.
 */
export async function getAvailableDates(): Promise<string[]> {
  const [settings] = await db.select().from(businessSettings).limit(1);

  if (!settings) {
    throw new NotFoundError("Business settings");
  }

  const workingDays = settings.workingDays as number[];
  const candidateDates = buildDateRange(workingDays, 90);

  if (candidateDates.length === 0) return [];

  const allSlots = generateTimeSlots(
    settings.openingTime,
    settings.closingTime,
    settings.durationMinutes
  );
  const totalSlotCount = allSlots.length;

  if (totalSlotCount === 0) return [];

  const firstDate = candidateDates[0]!;
  const lastDate = candidateDates[candidateDates.length - 1]!;

  // Single query: count booked slots per date across the entire 30-day range
  const bookedCounts = await db
    .select({
      date: appointments.appointmentDate,
      bookedCount: sql<number>`COUNT(*)`.as("booked_count"),
    })
    .from(appointments)
    .where(
      and(
        gte(appointments.appointmentDate, firstDate),
        lte(appointments.appointmentDate, lastDate),
        inArray(appointments.status, ["pending", "approved"])
      )
    )
    .groupBy(appointments.appointmentDate);

  // Build a map of date -> booked slot count
  const bookedMap = new Map<string, number>();
  for (const row of bookedCounts) {
    bookedMap.set(row.date, row.bookedCount);
  }

  // A date is available if it has fewer booked slots than total possible slots
  return candidateDates.filter((date) => {
    const booked = bookedMap.get(date) ?? 0;
    return booked < totalSlotCount;
  });
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

  // Single query for this specific date
  const bookedSlots = await db
    .select({ startTime: appointments.startTime })
    .from(appointments)
    .where(
      and(
        sql`${appointments.appointmentDate} = ${date}`,
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
