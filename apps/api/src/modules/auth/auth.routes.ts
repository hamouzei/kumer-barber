import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { loginDto, changePasswordDto } from "./auth.dto.js";
import { authLimiter } from "../../shared/middleware/rate-limiter.js";
import { requireAuth } from "./auth.middleware.js";
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

router.put(
  "/change-password",
  requireAuth,
  validate(changePasswordDto),
  authController.changePassword
);

export { router as authRoutes };
