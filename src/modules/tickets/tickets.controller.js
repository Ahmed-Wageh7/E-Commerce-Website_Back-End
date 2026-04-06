import express from "express";

import { auth, authorize } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import validateObjectIdParam from "../../middleware/validate-object-id.js";
import asyncHandler from "../../utils/async-handler.js";
import ticketsService from "./tickets.service.js";
import { createTicketSchema, replySchema, updateStatusSchema } from "./tickets.validation.js";

const router = express.Router();

router.post("/tickets", auth, validate(createTicketSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await ticketsService.createTicket(req.body, req.user._id));
}));

router.get("/tickets", auth, asyncHandler(async (req, res) => {
  res.status(200).json(await ticketsService.getMyTickets(req.user._id));
}));

router.get("/tickets/:id", auth, validateObjectIdParam("id"), asyncHandler(async (req, res) => {
  res.status(200).json(await ticketsService.getTicketDetails(req.params.id, req.user._id));
}));

router.post("/tickets/:id/reply", auth, validateObjectIdParam("id"), validate(replySchema), asyncHandler(async (req, res) => {
  res.status(200).json(await ticketsService.addReply(req.params.id, req.user, req.body.message));
}));

router.patch(
  "/admin/tickets/:id/status",
  auth,
  authorize("admin"),
  validateObjectIdParam("id"),
  validate(updateStatusSchema),
  asyncHandler(async (req, res) => {
    res.status(200).json(await ticketsService.updateStatus(req.params.id, req.body.status));
  })
);

export default router;
