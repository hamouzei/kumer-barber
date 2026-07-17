import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { updateSettingsDto } from "./settings.dto.js";
import { requireAuth } from "../auth/auth.middleware.js";
import * as settingsController from "./settings.controller.js";

const publicRouter = Router();
const adminRouter = Router();

// Public — only returns booking-relevant fields (deposit, payment instructions)
publicRouter.get("/", settingsController.getPublicSettings);

// Admin — full settings access
adminRouter.use(requireAuth);
adminRouter.get("/", settingsController.getSettings);
adminRouter.put(
  "/",
  validate(updateSettingsDto),
  settingsController.updateSettings
);

export { publicRouter as settingsPublicRoutes, adminRouter as settingsRoutes };
