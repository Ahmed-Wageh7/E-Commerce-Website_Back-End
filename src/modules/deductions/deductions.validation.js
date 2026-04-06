import { Joi } from "../../utils/validation.js";

const deductionSchema = Joi.object({
  amount: Joi.number().min(0).required(),
  reason: Joi.string().required(),
  date: Joi.date().required(),
  month: Joi.string()
    .pattern(/^\d{4}-\d{2}$/)
    .required()
});

export {
  deductionSchema
};
