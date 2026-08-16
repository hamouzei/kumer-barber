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
  app.set("trust proxy", 1);

  // ─── Global Middleware ───
  app.use(helmet());
  // FRONTEND_URL may be a comma-separated list of allowed origins,
  // e.g. "https://kumer-barber.vercel.app,http://localhost:3000"
  const allowedOrigins = env.FRONTEND_URL.split(",").map((o) => o.trim()).filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      },
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

  // ─── Root & Health Check ───
  app.get("/", (_req, res) => {
    res.status(200).json({
      status: "ok",
      name: "Kumer Barbershop API",
      health: "/api/v1/health",
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/favicon.ico", (_req, res) => {
    res.status(204).end();
  });

  app.get("/api/v1/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ─── 404 Catch-All ───
  app.use((_req, res) => {
    res.status(404).json({ error: "NotFound", message: "Route not found" });
  });

  // ─── Error Handler (must be last) ───
  app.use(errorHandler);

  return app;
}
