import mongoose from "mongoose";

import AppError from "../utils/app-error.js";

const validateObjectIdParam =
  (...paramNames) =>
  (req, res, next) => {
    for (const paramName of paramNames) {
      const value = req.params[paramName];
      if (value !== undefined && !mongoose.Types.ObjectId.isValid(value)) {
        return next(new AppError(`Invalid ${paramName}`, 400));
      }
    }

    next();
  };

export default validateObjectIdParam;
