import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { updateCustomerDto } from "./customers.dto.js";
import { requireAuth } from "../auth/auth.middleware.js";
import * as customersController from "./customers.controller.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  customersController.getAllCustomers
);

router.get("/:id", customersController.getCustomerDetail);

router.patch(
  "/:id",
  validate(updateCustomerDto),
  customersController.updateCustomer
);

export { router as customerRoutes };
