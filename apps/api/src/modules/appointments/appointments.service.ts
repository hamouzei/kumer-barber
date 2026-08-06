import { eq, and, sql, like, or, desc, count } from "drizzle-orm";
import { db, pool } from "../../db/client.js";
import {
  appointments,
  customers,
  notifications,
  businessSettings,
} from "../../db/schema/index.js";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../shared/errors/app-error.js";
import type {
  CreateBookingDto,
  AppointmentQueryDto,
} from "./appointments.dto.js";
import type { PaginatedResponse } from "../../shared/types.js";
import { randomBytes } from "node:crypto";

function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  if (h === undefined || m === undefined) return time;
  const totalMinutes = h * 60 + m + minutes;
  const newH = Math.floor(totalMinutes / 60);
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}:00`;
}

/** Generates a human-readable booking reference like KMKM-7X3K9M */
function generateBookingRef(): string {
  const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/I/1
  const bytes = randomBytes(6);
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CHARS[bytes[i]! % CHARS.length];
  }
  return `KMKM-${code}`;
}

export async function createBooking(
  dto: CreateBookingDto
): Promise<{ booking_id: number; booking_ref: string; status: string; message: string }> {
  const [settings] = await db.select().from(businessSettings).limit(1);
  if (!settings) {
    throw new NotFoundError("Business settings");
  }

  const endTime = addMinutesToTime(dto.start_time, settings.durationMinutes);
  const startTimeDb = dto.start_time + ":00";
  const bookingRef = generateBookingRef();

  // Use a raw connection for the transaction with pessimistic locking
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Pessimistic lock: SELECT FOR UPDATE on existing appointments for this slot
    const [existingRows] = await connection.execute(
      `SELECT appointment_id FROM appointments
       WHERE appointment_date = ? AND start_time = ? AND status IN ('pending', 'approved')
       FOR UPDATE`,
      [dto.appointment_date, startTimeDb]
    );

    const existing = existingRows as Array<Record<string, unknown>>;
    if (existing.length > 0) {
      await connection.rollback();
      throw new ConflictError(
        "This time slot is no longer available. Please select a different time."
      );
    }

    // Upsert customer by phone
    await connection.execute(
      `INSERT INTO customers (full_name, phone)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE full_name = VALUES(full_name)`,
      [dto.full_name, dto.phone]
    );

    // Get the customer ID
    const [customerRows] = await connection.execute(
      `SELECT customer_id FROM customers WHERE phone = ?`,
      [dto.phone]
    );
    const customerRow = (customerRows as Array<{ customer_id: number }>)[0];
    if (!customerRow) {
      await connection.rollback();
      throw new Error("Failed to resolve customer");
    }

    // Insert the appointment with booking reference
    const [insertResult] = await connection.execute(
      `INSERT INTO appointments
       (booking_ref, customer_id, appointment_date, start_time, end_time, status, payment_amount, payment_proof, version)
       VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, 1)`,
      [
        bookingRef,
        customerRow.customer_id,
        dto.appointment_date,
        startTimeDb,
        endTime,
        dto.payment_amount,
        dto.payment_proof,
      ]
    );

    const appointmentId = (insertResult as { insertId: number }).insertId;

    // Create admin notification
    await connection.execute(
      `INSERT INTO notifications
       (notification_type, appointment_id, recipient_type, title, message, is_read)
       VALUES ('new_booking', ?, 'admin', ?, ?, false)`,
      [
        appointmentId,
        "New Booking Request",
        `${dto.full_name} requested a booking for ${dto.appointment_date} at ${dto.start_time}`,
      ]
    );

    await connection.commit();

    return {
      booking_id: appointmentId,
      booking_ref: bookingRef,
      status: "pending",
      message: "Booking request submitted successfully.",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getBookingStatus(
  bookingRef: string
): Promise<{
  booking_id: number;
  booking_ref: string;
  status: string;
  appointment_date: string;
  time: string;
}> {
  const [appointment] = await db
    .select({
      bookingId: appointments.appointmentId,
      bookingRef: appointments.bookingRef,
      status: appointments.status,
      appointmentDate: appointments.appointmentDate,
      startTime: appointments.startTime,
    })
    .from(appointments)
    .where(eq(appointments.bookingRef, bookingRef))
    .limit(1);

  if (!appointment) {
    throw new NotFoundError("Booking", bookingRef);
  }

  return {
    booking_id: appointment.bookingId,
    booking_ref: appointment.bookingRef,
    status: appointment.status,
    appointment_date: appointment.appointmentDate,
    time: appointment.startTime.slice(0, 5),
  };
}

export async function getAllAppointments(
  query: AppointmentQueryDto
): Promise<PaginatedResponse<Record<string, unknown>>> {
  const conditions = [];

  if (query.status) {
    conditions.push(eq(appointments.status, query.status));
  }

  if (query.date) {
    conditions.push(eq(appointments.appointmentDate, query.date));
  }

  const whereClause =
    conditions.length > 0 ? and(...conditions) : undefined;

  // Build search condition separately if needed
  let searchCondition;
  if (query.search) {
    const pattern = `%${query.search}%`;
    searchCondition = or(
      like(customers.fullName, pattern),
      like(customers.phone, pattern)
    );
  }

  const finalWhere =
    whereClause && searchCondition
      ? and(whereClause, searchCondition)
      : whereClause ?? searchCondition;

  const offset = (query.page - 1) * query.limit;

  const [data, totalResult] = await Promise.all([
    db
      .select({
        appointmentId: appointments.appointmentId,
        bookingRef: appointments.bookingRef,
        appointmentDate: appointments.appointmentDate,
        startTime: appointments.startTime,
        endTime: appointments.endTime,
        status: appointments.status,
        paymentAmount: appointments.paymentAmount,
        paymentProof: appointments.paymentProof,
        rejectionReason: appointments.rejectionReason,
        createdAt: appointments.createdAt,
        customerName: customers.fullName,
        customerPhone: customers.phone,
      })
      .from(appointments)
      .innerJoin(customers, eq(appointments.customerId, customers.customerId))
      .where(finalWhere)
      .orderBy(desc(appointments.createdAt))
      .limit(query.limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(appointments)
      .innerJoin(customers, eq(appointments.customerId, customers.customerId))
      .where(finalWhere),
  ]);

  const total = totalResult[0]?.total ?? 0;

  return {
    data,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function getAppointmentDetail(id: number) {
  const [result] = await db
    .select({
      appointmentId: appointments.appointmentId,
      bookingRef: appointments.bookingRef,
      appointmentDate: appointments.appointmentDate,
      startTime: appointments.startTime,
      endTime: appointments.endTime,
      status: appointments.status,
      paymentAmount: appointments.paymentAmount,
      paymentProof: appointments.paymentProof,
      rejectionReason: appointments.rejectionReason,
      version: appointments.version,
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt,
      customerId: customers.customerId,
      customerName: customers.fullName,
      customerPhone: customers.phone,
    })
    .from(appointments)
    .innerJoin(customers, eq(appointments.customerId, customers.customerId))
    .where(eq(appointments.appointmentId, id))
    .limit(1);

  if (!result) {
    throw new NotFoundError("Appointment", id);
  }

  return {
    booking_id: result.appointmentId,
    booking_ref: result.bookingRef,
    customer: {
      id: result.customerId,
      name: result.customerName,
      phone: result.customerPhone,
    },
    appointment: {
      date: result.appointmentDate,
      time: result.startTime.slice(0, 5),
      end_time: result.endTime.slice(0, 5),
    },
    payment: {
      amount: result.paymentAmount,
      proof: result.paymentProof,
    },
    status: result.status,
    rejection_reason: result.rejectionReason,
    version: result.version,
    created_at: result.createdAt,
    updated_at: result.updatedAt,
  };
}

type ValidTransition = Record<string, string[]>;

const VALID_TRANSITIONS: ValidTransition = {
  pending: ["approved", "rejected", "cancelled"],
  approved: ["completed", "cancelled"],
};

async function transitionStatus(
  id: number,
  newStatus: string,
  reason?: string
): Promise<{ status: string }> {
  const detail = await getAppointmentDetail(id);
  const currentStatus = detail.status;

  const allowedNext = VALID_TRANSITIONS[currentStatus];
  if (!allowedNext?.includes(newStatus)) {
    throw new ValidationError(
      `Cannot transition from '${currentStatus}' to '${newStatus}'`
    );
  }

  // OCC: update only if version matches
  const result = await db
    .update(appointments)
    .set({
      status: newStatus as "approved" | "rejected" | "completed" | "cancelled",
      ...(reason && { rejectionReason: reason }),
      version: sql`version + 1`,
    })
    .where(
      and(
        eq(appointments.appointmentId, id),
        eq(appointments.version, detail.version)
      )
    );

  if (result[0].affectedRows === 0) {
    throw new ConflictError(
      "This appointment was modified by another request. Please refresh and try again."
    );
  }

  // Create notification for the customer
  const notificationTypes: Record<string, string> = {
    approved: "booking_approved",
    rejected: "booking_rejected",
    completed: "booking_completed",
    cancelled: "booking_cancelled",
  };

  const notificationTitles: Record<string, string> = {
    approved: "Booking Approved",
    rejected: "Booking Rejected",
    completed: "Appointment Completed",
    cancelled: "Booking Cancelled",
  };

  const notificationMessages: Record<string, string> = {
    approved: `Your booking for ${detail.appointment.date} at ${detail.appointment.time} has been approved.`,
    rejected: `Your booking for ${detail.appointment.date} at ${detail.appointment.time} has been rejected.${reason ? ` Reason: ${reason}` : ""}`,
    completed: `Your appointment on ${detail.appointment.date} at ${detail.appointment.time} has been marked as completed. Thank you!`,
    cancelled: `Your booking for ${detail.appointment.date} at ${detail.appointment.time} has been cancelled.`,
  };

  const notificationType = notificationTypes[newStatus];
  if (notificationType) {
    await db.insert(notifications).values({
      type: notificationType as "booking_approved" | "booking_rejected" | "booking_completed" | "booking_cancelled",
      appointmentId: id,
      recipientType: "customer",
      title: notificationTitles[newStatus] ?? "Status Update",
      message: notificationMessages[newStatus] ?? "Your booking status has been updated.",
      isRead: false,
    });
  }

  return { status: newStatus };
}

export async function approveAppointment(
  id: number
): Promise<{ status: string }> {
  return transitionStatus(id, "approved");
}

export async function rejectAppointment(
  id: number,
  reason?: string
): Promise<{ status: string }> {
  return transitionStatus(id, "rejected", reason);
}

export async function completeAppointment(
  id: number
): Promise<{ status: string }> {
  return transitionStatus(id, "completed");
}

export async function cancelAppointment(
  id: number
): Promise<{ status: string }> {
  return transitionStatus(id, "cancelled");
}

/**
 * Deletes all appointments whose appointment_date is before today.
 * Notifications linked to these appointments are cascade-deleted
 * by the FK constraint.
 */
export async function clearPastAppointments(): Promise<{ deletedCount: number }> {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const result = await db
    .delete(appointments)
    .where(sql`${appointments.appointmentDate} < ${today}`);

  const deletedCount = (result[0] as unknown as { affectedRows: number }).affectedRows;

  return { deletedCount };
}
