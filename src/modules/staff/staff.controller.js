import express from "express";

import { auth, authorize } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import validateObjectIdParam from "../../middleware/validate-object-id.js";
import { Joi } from "../../utils/validation.js";
import asyncHandler from "../../utils/async-handler.js";
import staffService from "./staff.service.js";
import { createStaffSchema, updateStaffSchema } from "./staff.validation.js";

const router = express.Router();

const adjustSalarySchema = Joi.object({
  finalSalary: Joi.number().min(0).required()
});

router.post("/admin/staff", auth, authorize("admin"), validate(createStaffSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await staffService.createStaff(req.body));
}));

router.get("/admin/staff", auth, authorize("admin"), asyncHandler(async (req, res) => {
  res.status(200).json(await staffService.getAllStaff());
}));

router.get("/admin/staff/:id", auth, authorize("admin"), validateObjectIdParam("id"), asyncHandler(async (req, res) => {
  res.status(200).json(await staffService.getStaffDetails(req.params.id));
}));

router.put("/admin/staff/:id", auth, authorize("admin"), validateObjectIdParam("id"), validate(updateStaffSchema), asyncHandler(async (req, res) => {
  res.status(200).json(await staffService.updateStaff(req.params.id, req.body));
}));

router.delete("/admin/staff/:id", auth, authorize("admin"), validateObjectIdParam("id"), asyncHandler(async (req, res) => {
  res.status(200).json(await staffService.deleteStaff(req.params.id));
}));

router.get("/admin/staff/:id/salary/:month", auth, authorize("admin"), validateObjectIdParam("id"), asyncHandler(async (req, res) => {
  res.status(200).json(await staffService.calculateSalary(req.params.id, req.params.month));
}));

router.post("/admin/staff/:id/salary/:month/pay", auth, authorize("admin"), validateObjectIdParam("id"), asyncHandler(async (req, res) => {
  res.status(200).json(await staffService.markSalaryPaid(req.params.id, req.params.month));
}));

router.put(
  "/admin/staff/:id/salary/:month/adjust",
  auth,
  authorize("admin"),
  validateObjectIdParam("id"),
  validate(adjustSalarySchema),
  asyncHandler(async (req, res) => {
    res.status(200).json(await staffService.adjustSalary(req.params.id, req.params.month, req.body.finalSalary));
  })
);

export default router;
