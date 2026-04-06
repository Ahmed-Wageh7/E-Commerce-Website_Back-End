import express from "express";

import { auth, authorize } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import validateObjectIdParam from "../../middleware/validate-object-id.js";
import controller from "./deductions.controller.js";
import { deductionSchema } from "./deductions.validation.js";

const router = express.Router();

router.post(
  "/admin/staff/:id/deductions",
  auth,
  authorize("admin"),
  validateObjectIdParam("id"),
  validate(deductionSchema),
  controller.addDeduction
);
router.get("/admin/staff/:id/deductions", auth, authorize("admin"), validateObjectIdParam("id"), controller.getDeductions);
router.put(
  "/admin/staff/:id/deductions/:deductionId",
  auth,
  authorize("admin"),
  validateObjectIdParam("id", "deductionId"),
  validate(deductionSchema),
  controller.updateDeduction
);
router.delete(
  "/admin/staff/:id/deductions/:deductionId",
  auth,
  authorize("admin"),
  validateObjectIdParam("id", "deductionId"),
  controller.deleteDeduction
);

export default router;
