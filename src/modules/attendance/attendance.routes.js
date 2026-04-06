import express from "express";

import { auth, authorize } from "../../middleware/auth.js";
import controller from "./attendance.controller.js";

const router = express.Router();

router.post("/staff/checkin", auth, authorize("staff"), controller.checkIn);
router.post("/staff/checkout", auth, authorize("staff"), controller.checkOut);

export default router;
