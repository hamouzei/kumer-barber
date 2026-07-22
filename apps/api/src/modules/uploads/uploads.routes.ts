import { Router } from "express";
import multer from "multer";
import * as uploadsController from "./uploads.controller.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = Router();

router.post(
  "/payment-proof",
  upload.single("payment_proof"),
  uploadsController.uploadPaymentProof
);

router.post(
  "/content-image",
  upload.single("image"),
  uploadsController.uploadContentImage
);

export { router as uploadRoutes };
