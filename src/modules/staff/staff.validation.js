import { Joi, objectId } from "../../utils/validation.js";

const createStaffSchema = Joi.object({
  user: objectId.required(),
  dailySalary: Joi.number().min(0).required(),
  joinDate: Joi.date().required(),
  department: Joi.string().required(),
  isActive: Joi.boolean()
});

const updateStaffSchema = Joi.object({
  dailySalary: Joi.number().min(0),
  joinDate: Joi.date(),
  department: Joi.string(),
  isActive: Joi.boolean()
});

export {
  createStaffSchema,
  updateStaffSchema
};
