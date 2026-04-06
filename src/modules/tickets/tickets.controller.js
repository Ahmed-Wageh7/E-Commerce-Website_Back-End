import Ticket from "../../database/model/ticket.model.js";
import AppError from "../../utils/app-error.js";
import asyncHandler from "../../utils/async-handler.js";

const createTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.create({
    ...req.body,
    user: req.user._id
  });

  res.status(201).json({ message: "Ticket created", ticket });
});

const getMyTickets = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({ user: req.user._id });
  res.status(200).json({ tickets });
});

const getTicketDetails = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findOne({ _id: req.params.id, user: req.user._id });
  if (!ticket) throw new AppError("Ticket not found", 404);
  res.status(200).json({ ticket });
});

const addReply = asyncHandler(async (req, res) => {
  const filter =
    req.user.role === "admin"
      ? { _id: req.params.id }
      : { _id: req.params.id, user: req.user._id };
  const ticket = await Ticket.findOne(filter);
  if (!ticket) throw new AppError("Ticket not found", 404);

  ticket.replies.push({
    sender: req.user._id,
    message: req.body.message,
    isAdmin: req.user.role === "admin"
  });

  await ticket.save();
  res.status(200).json({ message: "Reply added", ticket });
});

const updateStatus = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  if (!ticket) throw new AppError("Ticket not found", 404);
  res.status(200).json({ message: "Ticket status updated", ticket });
});

export default {
  createTicket,
  getMyTickets,
  getTicketDetails,
  addReply,
  updateStatus
};
