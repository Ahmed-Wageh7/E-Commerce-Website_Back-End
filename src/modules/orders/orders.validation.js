import { Joi } from "../../utils/validation.js";

const checkoutSchema = Joi.object({
  paymentMethod: Joi.string().valid("cod", "card").default("cod"),
  shippingAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    country: Joi.string().required(),
    postalCode: Joi.string().required()
  }).required()
});

const updateOrderStatusSchema = Joi.object({
  orderStatus: Joi.string()
    .valid("pending", "processing", "shipped", "delivered", "cancelled")
    .required()
});

const stripeIntentSchema = Joi.object({
  orderId: Joi.string().required()
});

export {
  checkoutSchema,
  updateOrderStatusSchema,
  stripeIntentSchema
};
