import AppError from "../utils/app-error.js";

const validate = (schema, property = "body") => (req, res, next) => {
  const { error, value } = schema.validate(req[property], {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return next(
      new AppError("Validation failed", 400, error.details.map((detail) => detail.message))
    );
  }

  req[property] = value;
  next();
};

export default validate;
