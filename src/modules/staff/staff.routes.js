import express from "express";

import { auth, authorize } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import validateObjectIdParam from "../../middleware/validate-object-id.js";
import controller from "./staff.controller.js";
import { createStaffSchema, updateStaffSchema } from "./staff.validation.js";
import { Joi } from "../../utils/validation.js";

const router = express.Router();

const adjustSalarySchema = Joi.object({
  finalSalary: Joi.number().min(0).required()
});

router.post("/admin/staff", auth, authorize("admin"), validate(createStaffSchema), controller.createStaff);
router.get("/admin/staff", auth, authorize("admin"), controller.getAllStaff);
router.get("/admin/staff/:id", auth, authorize("admin"), validateObjectIdParam("id"), controller.getStaffDetails);
router.put(
  "/admin/staff/:id",
  auth,
  authorize("admin"),
  validateObjectIdParam("id"),
  validate(updateStaffSchema),
  controller.updateStaff
);
router.delete("/admin/staff/:id", auth, authorize("admin"), validateObjectIdParam("id"), controller.deleteStaff);
router.get("/admin/staff/:id/salary/:month", auth, authorize("admin"), validateObjectIdParam("id"), controller.calculateSalary);
router.post("/admin/staff/:id/salary/:month/pay", auth, authorize("admin"), validateObjectIdParam("id"), controller.markSalaryPaid);
router.put(
  "/admin/staff/:id/salary/:month/adjust",
  auth,
  authorize("admin"),
  validateObjectIdParam("id"),
  validate(adjustSalarySchema),
  controller.adjustSalary
);

export default router;
