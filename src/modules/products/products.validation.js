import { Joi, objectId } from "../../utils/validation.js";

const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow("", null),
  price: Joi.number().min(0).required(),
  stock: Joi.number().integer().min(0).required(),
  category: objectId.required(),
  subcategory: objectId.required(),
  images: Joi.array().items(Joi.string()).default([])
});

const stockSchema = Joi.object({
  stock: Joi.number().integer().min(0).required()
});

export {
  productSchema,
  stockSchema
};
