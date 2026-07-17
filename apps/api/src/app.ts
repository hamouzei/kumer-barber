import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { requestId } from "./shared/middleware/request-id.js";
import { errorHandler } from "./shared/middleware/error-handler.js";
import { generalLimiter } from "./shared/middleware/rate-limiter.js";
import { logger } from "./shared/logger.js";

// Route imports
import { authRoutes } from "./modules/auth/auth.routes.js";
import { availabilityRoutes } from "./modules/availability/availability.routes.js";
import {
  bookingRoutes,
  adminAppointmentRoutes,
} from "./modules/appointments/appointments.routes.js";
import { uploadRoutes } from "./modules/uploads/uploads.routes.js";
import { customerRoutes } from "./modules/customers/customers.routes.js";
import {
  galleryPublicRoutes,
  galleryAdminRoutes,
} from "./modules/gallery/gallery.routes.js";
import {
  contentPublicRoutes,
  contentAdminRoutes,
} from "./modules/website-content/website-content.routes.js";
import {
  settingsPublicRoutes,
  settingsRoutes,
} from "./modules/settings/settings.routes.js";
import {
  notificationAdminRoutes,
  notificationPublicRoutes,
} from "./modules/notifications/notifications.routes.js";
import { dashboardRoutes } from "./modules/dashboard/dashboard.routes.js";

export function createApp() {
  const app = express();

  // ─── Global Middleware ───
  app.use(helmet());
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "x-request-id"],
    })
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(requestId);
  app.use(generalLimiter);

  // Request logging
  app.use((req, _res, next) => {
    logger.info(
      { requestId: req.requestId, method: req.method, path: req.path },
      `${req.method} ${req.path}`
    );
    next();
  });

  // ─── Public Routes ───
  app.use("/api/v1/availability", availabilityRoutes);
  app.use("/api/v1/bookings", bookingRoutes);
  app.use("/api/v1/bookings", notificationPublicRoutes);
  app.use("/api/v1/uploads", uploadRoutes);
  app.use("/api/v1/gallery", galleryPublicRoutes);
  app.use("/api/v1/website", contentPublicRoutes);
  app.use("/api/v1/settings", settingsPublicRoutes);

  // ─── Admin Routes ───
  app.use("/api/v1/admin", authRoutes);
  app.use("/api/v1/admin/dashboard", dashboardRoutes);
  app.use("/api/v1/admin/appointments", adminAppointmentRoutes);
  app.use("/api/v1/admin/customers", customerRoutes);
  app.use("/api/v1/admin/gallery", galleryAdminRoutes);
  app.use("/api/v1/admin/content", contentAdminRoutes);
  app.use("/api/v1/admin/settings", settingsRoutes);
  app.use("/api/v1/admin/notifications", notificationAdminRoutes);

  // ─── Health Check ───
  app.get("/api/v1/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ─── Error Handler (must be last) ───
  app.use(errorHandler);

  return app;
}
