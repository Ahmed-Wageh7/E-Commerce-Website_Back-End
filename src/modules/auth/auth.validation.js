import { Joi } from "../../utils/validation.js";

const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

const signupSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().pattern(passwordPattern).required().messages({
    "string.pattern.base":
      "Password must be at least 8 characters and include 1 uppercase letter and 1 number"
  }),
  phone: Joi.string().allow("", null)
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const emailSchema = Joi.object({
  email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().pattern(passwordPattern).required().messages({
    "string.pattern.base":
      "Password must be at least 8 characters and include 1 uppercase letter and 1 number"
  })
});

export {
  signupSchema,
  loginSchema,
  emailSchema,
  resetPasswordSchema
};
