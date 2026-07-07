import type { Request, Response } from "express";
import * as settingsService from "./settings.service.js";
import type { UpdateSettingsDto } from "./settings.dto.js";

export async function getSettings(
  _req: Request,
  res: Response
): Promise<void> {
  const settings = await settingsService.getSettings();
  res.status(200).json(settings);
}

export async function updateSettings(
  req: Request,
  res: Response
): Promise<void> {
  const dto = req.body as UpdateSettingsDto;
  const result = await settingsService.updateSettings(dto);
  res.status(200).json(result);
}
