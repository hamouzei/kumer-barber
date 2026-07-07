import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { updateSettingsDto } from "./settings.dto.js";
import { requireAuth } from "../auth/auth.middleware.js";
import * as settingsController from "./settings.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", settingsController.getSettings);
router.put(
  "/",
  validate(updateSettingsDto),
  settingsController.updateSettings
);

export { router as settingsRoutes };
