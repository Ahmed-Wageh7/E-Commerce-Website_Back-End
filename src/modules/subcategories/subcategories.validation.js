import { Joi, objectId } from "../../utils/validation.js";

const subcategorySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow("", null),
  category: objectId.required()
});

export {
  subcategorySchema
};
