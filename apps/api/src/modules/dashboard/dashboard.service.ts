import { eq, and, sql, count, desc } from "drizzle-orm";
import { db } from "../../db/client.js";
import { appointments, customers } from "../../db/schema/index.js";

export async function getDashboardSummary() {
  const today = new Date().toISOString().split("T")[0]!;
  const currentMonth = today.slice(0, 7); // YYYY-MM

  const [
    todayAppointments,
    pendingBookings,
    approvedBookings,
    completedToday,
    cancelledTotal,
    monthlyRevenue,
    recentPending,
  ] = await Promise.all([
    // Today's appointments (approved + completed)
    db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          eq(appointments.appointmentDate, today),
          sql`${appointments.status} IN ('approved', 'completed')`
        )
      ),

    // Pending bookings
    db
      .select({ count: count() })
      .from(appointments)
      .where(eq(appointments.status, "pending")),

    // Approved bookings
    db
      .select({ count: count() })
      .from(appointments)
      .where(eq(appointments.status, "approved")),

    // Completed today
    db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          eq(appointments.appointmentDate, today),
          eq(appointments.status, "completed")
        )
      ),

    // Cancelled total
    db
      .select({ count: count() })
      .from(appointments)
      .where(eq(appointments.status, "cancelled")),

    // Monthly revenue
    db
      .select({
        total: sql<string>`COALESCE(SUM(${appointments.paymentAmount}), 0)`,
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.status, "completed"),
          sql`${appointments.appointmentDate} LIKE ${currentMonth + "%"}`
        )
      ),

    // Recent pending bookings (latest 5)
    db
      .select({
        appointmentId: appointments.appointmentId,
        appointmentDate: appointments.appointmentDate,
        startTime: appointments.startTime,
        paymentAmount: appointments.paymentAmount,
        createdAt: appointments.createdAt,
        customerName: customers.fullName,
        customerPhone: customers.phone,
      })
      .from(appointments)
      .innerJoin(customers, eq(appointments.customerId, customers.customerId))
      .where(eq(appointments.status, "pending"))
      .orderBy(desc(appointments.createdAt))
      .limit(5),
  ]);

  return {
    todayAppointments: todayAppointments[0]?.count ?? 0,
    pendingBookings: pendingBookings[0]?.count ?? 0,
    approvedBookings: approvedBookings[0]?.count ?? 0,
    completedToday: completedToday[0]?.count ?? 0,
    cancelledTotal: cancelledTotal[0]?.count ?? 0,
    monthlyRevenue: parseFloat(monthlyRevenue[0]?.total ?? "0"),
    recentPending,
  };
}
