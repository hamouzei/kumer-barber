import type { Request, Response } from "express";
import * as appointmentsService from "./appointments.service.js";
import {
  createBookingDto,
  appointmentQueryDto,
} from "./appointments.dto.js";
import type {
  CreateBookingDto,
  UpdateAppointmentStatusDto,
} from "./appointments.dto.js";

export async function createBooking(
  req: Request,
  res: Response
): Promise<void> {
  const dto = req.body as CreateBookingDto;
  const result = await appointmentsService.createBooking(dto);
  res.status(201).json(result);
}

export async function getBookingStatus(
  req: Request,
  res: Response
): Promise<void> {
  const id = Number(req.params.id);
  const result = await appointmentsService.getBookingStatus(id);
  res.status(200).json(result);
}

export async function getAllAppointments(
  req: Request,
  res: Response
): Promise<void> {
  const query = appointmentQueryDto.parse(req.query);
  const result = await appointmentsService.getAllAppointments(query);
  res.status(200).json(result);
}

export async function getAppointmentDetail(
  req: Request,
  res: Response
): Promise<void> {
  const id = Number(req.params.id);
  const result = await appointmentsService.getAppointmentDetail(id);
  res.status(200).json(result);
}

export async function approveAppointment(
  req: Request,
  res: Response
): Promise<void> {
  const id = Number(req.params.id);
  const result = await appointmentsService.approveAppointment(id);
  res.status(200).json(result);
}

export async function rejectAppointment(
  req: Request,
  res: Response
): Promise<void> {
  const id = Number(req.params.id);
  const { reason } = req.body as UpdateAppointmentStatusDto;
  const result = await appointmentsService.rejectAppointment(id, reason);
  res.status(200).json(result);
}

export async function completeAppointment(
  req: Request,
  res: Response
): Promise<void> {
  const id = Number(req.params.id);
  const result = await appointmentsService.completeAppointment(id);
  res.status(200).json(result);
}

export async function cancelAppointment(
  req: Request,
  res: Response
): Promise<void> {
  const id = Number(req.params.id);
  const result = await appointmentsService.cancelAppointment(id);
  res.status(200).json(result);
}
