import { Joi, objectId } from "../../utils/validation.js";

const addToCartSchema = Joi.object({
  productId: objectId.required(),
  quantity: Joi.number().integer().min(1).required()
});

const updateCartSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required()
});

export {
  addToCartSchema,
  updateCartSchema
};
