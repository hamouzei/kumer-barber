import { eq, like, or, desc, count, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import { customers, appointments } from "../../db/schema/index.js";
import { NotFoundError } from "../../shared/errors/app-error.js";
import type { CustomerQueryDto, UpdateCustomerDto } from "./customers.dto.js";
import type { PaginatedResponse } from "../../shared/types.js";

export async function getAllCustomers(
  query: CustomerQueryDto
): Promise<PaginatedResponse<Record<string, unknown>>> {
  const offset = (query.page - 1) * query.limit;

  let searchCondition;
  if (query.search) {
    const pattern = `%${query.search}%`;
    searchCondition = or(
      like(customers.fullName, pattern),
      like(customers.phone, pattern)
    );
  }

  const [data, totalResult] = await Promise.all([
    db
      .select({
        customerId: customers.customerId,
        fullName: customers.fullName,
        phone: customers.phone,
        notes: customers.notes,
        createdAt: customers.createdAt,
        totalVisits: sql<number>`(
          SELECT COUNT(*) FROM appointments
          WHERE appointments.customer_id = ${customers.customerId}
          AND appointments.status = 'completed'
        )`.as("total_visits"),
        lastVisit: sql<string | null>`(
          SELECT MAX(appointment_date) FROM appointments
          WHERE appointments.customer_id = ${customers.customerId}
          AND appointments.status = 'completed'
        )`.as("last_visit"),
      })
      .from(customers)
      .where(searchCondition)
      .orderBy(desc(customers.createdAt))
      .limit(query.limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(customers)
      .where(searchCondition),
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

export async function getCustomerDetail(id: number) {
  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.customerId, id))
    .limit(1);

  if (!customer) {
    throw new NotFoundError("Customer", id);
  }

  const appointmentHistory = await db
    .select({
      appointmentId: appointments.appointmentId,
      appointmentDate: appointments.appointmentDate,
      startTime: appointments.startTime,
      status: appointments.status,
      paymentAmount: appointments.paymentAmount,
      createdAt: appointments.createdAt,
    })
    .from(appointments)
    .where(eq(appointments.customerId, id))
    .orderBy(desc(appointments.appointmentDate));

  return {
    ...customer,
    appointments: appointmentHistory,
  };
}

export async function updateCustomer(
  id: number,
  dto: UpdateCustomerDto
) {
  const [existing] = await db
    .select()
    .from(customers)
    .where(eq(customers.customerId, id))
    .limit(1);

  if (!existing) {
    throw new NotFoundError("Customer", id);
  }

  await db
    .update(customers)
    .set({ notes: dto.notes ?? null })
    .where(eq(customers.customerId, id));

  return { ...existing, notes: dto.notes ?? null };
}
