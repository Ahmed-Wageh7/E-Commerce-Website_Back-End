import express from "express";

import { auth, authorize } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import validateObjectIdParam from "../../middleware/validate-object-id.js";
import controller from "./tickets.controller.js";
import { createTicketSchema, replySchema, updateStatusSchema } from "./tickets.validation.js";

const router = express.Router();

router.post("/tickets", auth, validate(createTicketSchema), controller.createTicket);
router.get("/tickets", auth, controller.getMyTickets);
router.get("/tickets/:id", auth, validateObjectIdParam("id"), controller.getTicketDetails);
router.post("/tickets/:id/reply", auth, validateObjectIdParam("id"), validate(replySchema), controller.addReply);
router.patch(
  "/admin/tickets/:id/status",
  auth,
  authorize("admin"),
  validateObjectIdParam("id"),
  validate(updateStatusSchema),
  controller.updateStatus
);

export default router;
