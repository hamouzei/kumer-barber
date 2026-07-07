import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import * as notificationsController from "./notifications.controller.js";

const adminRouter = Router();
const publicRouter = Router();

// Admin routes
adminRouter.use(requireAuth);
adminRouter.get("/", notificationsController.getAdminNotifications);
adminRouter.patch("/:id/read", notificationsController.markAsRead);
adminRouter.patch("/read-all", notificationsController.markAllAsRead);

// Public: customer can see notifications for their booking
publicRouter.get(
  "/:id/notifications",
  notificationsController.getBookingNotifications
);

export {
  adminRouter as notificationAdminRoutes,
  publicRouter as notificationPublicRoutes,
};
