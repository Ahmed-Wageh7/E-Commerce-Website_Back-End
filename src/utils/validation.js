import Joi from "joi";

const objectId = Joi.string().length(24).hex();

export {
  Joi,
  objectId
};
