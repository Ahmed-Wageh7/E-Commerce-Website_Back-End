import express from "express";

import { auth, authorize } from "../../middleware/auth.js";
import asyncHandler from "../../utils/async-handler.js";
import attendanceService from "./attendance.service.js";

const router = express.Router();

router.post("/staff/checkin", auth, authorize("staff"), asyncHandler(async (req, res) => {
  res.status(201).json(await attendanceService.checkIn(req.user._id));
}));

router.post("/staff/checkout", auth, authorize("staff"), asyncHandler(async (req, res) => {
  res.status(200).json(await attendanceService.checkOut(req.user._id));
}));

export default router;
