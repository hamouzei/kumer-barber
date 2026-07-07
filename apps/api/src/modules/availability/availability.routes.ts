import { Router } from "express";
import * as availabilityController from "./availability.controller.js";

const router = Router();

router.get("/", availabilityController.getAvailableDates);
router.get("/:date", availabilityController.getAvailableSlots);

export { router as availabilityRoutes };
