import express from "express";

import { auth, authorize } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import validateObjectIdParam from "../../middleware/validate-object-id.js";
import asyncHandler from "../../utils/async-handler.js";
import deductionsService from "./deductions.service.js";
import { deductionSchema } from "./deductions.validation.js";

const router = express.Router();

router.post(
  "/admin/staff/:id/deductions",
  auth,
  authorize("admin"),
  validateObjectIdParam("id"),
  validate(deductionSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(await deductionsService.addDeduction(req.params.id, req.body));
  })
);
router.get("/admin/staff/:id/deductions", auth, authorize("admin"), validateObjectIdParam("id"), asyncHandler(async (req, res) => {
  res.status(200).json(await deductionsService.getDeductions(req.params.id));
}));
router.put(
  "/admin/staff/:id/deductions/:deductionId",
  auth,
  authorize("admin"),
  validateObjectIdParam("id", "deductionId"),
  validate(deductionSchema),
  asyncHandler(async (req, res) => {
    res.status(200).json(await deductionsService.updateDeduction(req.params.id, req.params.deductionId, req.body));
  })
);
router.delete(
  "/admin/staff/:id/deductions/:deductionId",
  auth,
  authorize("admin"),
  validateObjectIdParam("id", "deductionId"),
  asyncHandler(async (req, res) => {
    res.status(200).json(await deductionsService.deleteDeduction(req.params.id, req.params.deductionId));
  })
);

export default router;
