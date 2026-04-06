import { Joi } from "../../utils/validation.js";

const createTicketSchema = Joi.object({
  subject: Joi.string().required(),
  description: Joi.string().required(),
  priority: Joi.string().valid("low", "medium", "high").default("medium")
});

const replySchema = Joi.object({
  message: Joi.string().required()
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid("open", "in-progress", "resolved", "closed").required()
});

export {
  createTicketSchema,
  replySchema,
  updateStatusSchema
};
