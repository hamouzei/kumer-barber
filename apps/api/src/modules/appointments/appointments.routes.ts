import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import {
  createBookingDto,
  updateAppointmentStatusDto,
} from "./appointments.dto.js";
import { bookingLimiter } from "../../shared/middleware/rate-limiter.js";
import { requireAuth } from "../auth/auth.middleware.js";
import * as appointmentsController from "./appointments.controller.js";

const publicRouter = Router();
const adminRouter = Router();

// Public routes
publicRouter.post(
  "/",
  bookingLimiter,
  validate(createBookingDto),
  appointmentsController.createBooking
);

publicRouter.get("/:ref", appointmentsController.getBookingStatus);

// Admin routes (all require auth)
adminRouter.use(requireAuth);

adminRouter.get(
  "/",
  appointmentsController.getAllAppointments
);

adminRouter.get("/:id", appointmentsController.getAppointmentDetail);

adminRouter.patch(
  "/:id/approve",
  appointmentsController.approveAppointment
);

adminRouter.patch(
  "/:id/reject",
  validate(updateAppointmentStatusDto),
  appointmentsController.rejectAppointment
);

adminRouter.patch(
  "/:id/complete",
  appointmentsController.completeAppointment
);

adminRouter.patch(
  "/:id/cancel",
  appointmentsController.cancelAppointment
);

export { publicRouter as bookingRoutes, adminRouter as adminAppointmentRoutes };
