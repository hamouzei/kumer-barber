import { Router } from "express";
import multer from "multer";
import { validate } from "../../shared/middleware/validate.js";
import { updateGalleryImageDto } from "./gallery.dto.js";
import { requireAuth } from "../auth/auth.middleware.js";
import * as galleryController from "./gallery.controller.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const publicRouter = Router();
const adminRouter = Router();

// Public
publicRouter.get("/", galleryController.getAllImages);

// Admin
adminRouter.use(requireAuth);
adminRouter.post("/", upload.single("image"), galleryController.uploadImage);
adminRouter.put(
  "/:id",
  validate(updateGalleryImageDto),
  galleryController.updateImage
);
adminRouter.delete("/:id", galleryController.deleteImage);

export { publicRouter as galleryPublicRoutes, adminRouter as galleryAdminRoutes };
