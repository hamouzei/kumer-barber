import type { Request, Response } from "express";
import * as uploadsService from "./uploads.service.js";
import { ValidationError } from "../../shared/errors/app-error.js";

export async function uploadPaymentProof(
  req: Request,
  res: Response
): Promise<void> {
  const file = req.file;
  if (!file) {
    throw new ValidationError("No file provided");
  }

  const result = await uploadsService.uploadPaymentProof(file);
  res.status(201).json({ url: result.url });
}

export async function uploadContentImage(
  req: Request,
  res: Response
): Promise<void> {
  const file = req.file;
  if (!file) {
    throw new ValidationError("No file provided");
  }

  const result = await uploadsService.uploadContentImage(file);
  res.status(201).json({ url: result.url });
}
