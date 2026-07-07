import type { Request, Response } from "express";
import * as contentService from "./website-content.service.js";
import type { UpdateContentDto } from "./website-content.dto.js";

export async function getPublicContent(
  _req: Request,
  res: Response
): Promise<void> {
  const content = await contentService.getPublicContent();
  res.status(200).json(content);
}

export async function getAllContent(
  _req: Request,
  res: Response
): Promise<void> {
  const content = await contentService.getAllContent();
  res.status(200).json(content);
}

export async function updateSection(
  req: Request,
  res: Response
): Promise<void> {
  const sectionKey = req.params.sectionKey as string;
  const dto = req.body as UpdateContentDto;
  const result = await contentService.updateSection(sectionKey, dto);
  res.status(200).json(result);
}
