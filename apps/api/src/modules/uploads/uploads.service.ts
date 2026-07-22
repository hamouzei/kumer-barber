import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";
import { env } from "../../config/env.js";
import { ValidationError } from "../../shared/errors/app-error.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function uploadPaymentProof(
  file: Express.Multer.File
): Promise<{ url: string; public_id: string }> {
  validateFile(file);

  const result = await uploadToCloudinary(file.buffer, "payment-proofs");

  return {
    url: result.secure_url,
    public_id: result.public_id,
  };
}

export async function uploadGalleryImage(
  file: Express.Multer.File
): Promise<{ url: string; public_id: string }> {
  validateFile(file);

  const result = await uploadToCloudinary(file.buffer, "gallery");

  return {
    url: result.secure_url,
    public_id: result.public_id,
  };
}

export async function uploadContentImage(
  file: Express.Multer.File
): Promise<{ url: string; public_id: string }> {
  validateFile(file);

  const result = await uploadToCloudinary(file.buffer, "content");

  return {
    url: result.secure_url,
    public_id: result.public_id,
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

function validateFile(file: Express.Multer.File): void {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new ValidationError(
      `Invalid file type '${file.mimetype}'. Allowed: JPG, PNG, WEBP`
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new ValidationError(
      `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds maximum of 5MB`
    );
  }
}

function uploadToCloudinary(
  buffer: Buffer,
  folder: string
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `barber/${folder}`,
        resource_type: "image",
        transformation: [
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result);
        } else {
          reject(new Error("Upload returned no result"));
        }
      }
    );

    stream.end(buffer);
  });
}
