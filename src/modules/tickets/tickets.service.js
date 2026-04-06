import Ticket from "../../database/model/ticket.model.js";
import AppError from "../../utils/app-error.js";

const createTicket = async (payload, userId) => {
  const ticket = await Ticket.create({
    ...payload,
    user: userId
  });

  return { message: "Ticket created", ticket };
};

const getMyTickets = async (userId) => {
  const tickets = await Ticket.find({ user: userId });
  return { tickets };
};

const getTicketDetails = async (id, userId) => {
  const ticket = await Ticket.findOne({ _id: id, user: userId });
  if (!ticket) throw new AppError("Ticket not found", 404);
  return { ticket };
};

const addReply = async (id, user, message) => {
  const filter = user.role === "admin" ? { _id: id } : { _id: id, user: user._id };
  const ticket = await Ticket.findOne(filter);
  if (!ticket) throw new AppError("Ticket not found", 404);

  ticket.replies.push({
    sender: user._id,
    message,
    isAdmin: user.role === "admin"
  });

  await ticket.save();
  return { message: "Reply added", ticket };
};

const updateStatus = async (id, status) => {
  const ticket = await Ticket.findByIdAndUpdate(id, { status }, { new: true });
  if (!ticket) throw new AppError("Ticket not found", 404);
  return { message: "Ticket status updated", ticket };
};

export default {
  createTicket,
  getMyTickets,
  getTicketDetails,
  addReply,
  updateStatus
};
