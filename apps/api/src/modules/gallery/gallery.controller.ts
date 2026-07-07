import type { Request, Response } from "express";
import * as galleryService from "./gallery.service.js";
import { ValidationError } from "../../shared/errors/app-error.js";
import type { UpdateGalleryImageDto } from "./gallery.dto.js";

export async function getAllImages(
  _req: Request,
  res: Response
): Promise<void> {
  const images = await galleryService.getAllImages();
  res.status(200).json(images);
}

export async function uploadImage(
  req: Request,
  res: Response
): Promise<void> {
  const file = req.file;
  if (!file) {
    throw new ValidationError("No image file provided");
  }

  const title = req.body.title as string | undefined;
  const result = await galleryService.uploadImage(file, title);
  res.status(201).json(result);
}

export async function updateImage(
  req: Request,
  res: Response
): Promise<void> {
  const id = Number(req.params.id);
  const dto = req.body as UpdateGalleryImageDto;
  const result = await galleryService.updateImage(id, dto);
  res.status(200).json(result);
}

export async function deleteImage(
  req: Request,
  res: Response
): Promise<void> {
  const id = Number(req.params.id);
  await galleryService.deleteImage(id);
  res.status(204).send();
}
