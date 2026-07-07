import type { Request, Response } from "express";
import * as notificationsService from "./notifications.service.js";

export async function getAdminNotifications(
  _req: Request,
  res: Response
): Promise<void> {
  const result = await notificationsService.getAdminNotifications();
  res.status(200).json(result);
}

export async function markAsRead(
  req: Request,
  res: Response
): Promise<void> {
  const id = Number(req.params.id);
  await notificationsService.markAsRead(id);
  res.status(200).json({ message: "Notification marked as read" });
}

export async function markAllAsRead(
  _req: Request,
  res: Response
): Promise<void> {
  await notificationsService.markAllAsRead();
  res.status(200).json({ message: "All notifications marked as read" });
}

export async function getBookingNotifications(
  req: Request,
  res: Response
): Promise<void> {
  const appointmentId = Number(req.params.id);
  const result =
    await notificationsService.getBookingNotifications(appointmentId);
  res.status(200).json(result);
}
