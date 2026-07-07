import type { Request, Response } from "express";
import * as availabilityService from "./availability.service.js";

export async function getAvailableDates(
  _req: Request,
  res: Response
): Promise<void> {
  const dates = await availabilityService.getAvailableDates();
  res.status(200).json(dates);
}

export async function getAvailableSlots(
  req: Request,
  res: Response
): Promise<void> {
  const date = req.params.date as string;
  const result = await availabilityService.getAvailableSlots(date);
  res.status(200).json(result);
}
