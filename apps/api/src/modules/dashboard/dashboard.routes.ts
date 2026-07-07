import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import * as dashboardController from "./dashboard.controller.js";

const router = Router();

router.use(requireAuth);
router.get("/", dashboardController.getDashboardSummary);

export { router as dashboardRoutes };
