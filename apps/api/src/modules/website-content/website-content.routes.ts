import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { updateContentDto } from "./website-content.dto.js";
import { requireAuth } from "../auth/auth.middleware.js";
import * as contentController from "./website-content.controller.js";

const publicRouter = Router();
const adminRouter = Router();

// Public
publicRouter.get("/", contentController.getPublicContent);

// Admin
adminRouter.use(requireAuth);
adminRouter.get("/", contentController.getAllContent);
adminRouter.put(
  "/:sectionKey",
  validate(updateContentDto),
  contentController.updateSection
);

export {
  publicRouter as contentPublicRoutes,
  adminRouter as contentAdminRoutes,
};
