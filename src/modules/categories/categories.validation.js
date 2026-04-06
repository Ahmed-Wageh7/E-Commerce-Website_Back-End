import { Joi } from "../../utils/validation.js";

const categorySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow("", null)
});

export {
  categorySchema
};
