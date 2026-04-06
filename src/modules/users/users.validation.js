import { Joi } from "../../utils/validation.js";

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  phone: Joi.string().allow("", null)
});

export {
  updateProfileSchema
};
