import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { loginDto } from "./auth.dto.js";
import { authLimiter } from "../../shared/middleware/rate-limiter.js";
import * as authController from "./auth.controller.js";

const router = Router();

router.post(
  "/login",
  authLimiter,
  validate(loginDto),
  authController.login
);

router.post("/refresh", authLimiter, authController.refresh);

router.post("/logout", authController.logout);

export { router as authRoutes };
