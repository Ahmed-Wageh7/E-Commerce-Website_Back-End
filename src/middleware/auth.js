import jwt from "jsonwebtoken";

import env from "../../config/env.service.js";
import User from "../database/model/user.model.js";
import AppError from "../utils/app-error.js";
import asyncHandler from "../utils/async-handler.js";

const auth = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new AppError("Authorization token is required", 401);
  }

  const payload = jwt.verify(token, env.jwtSecret);
  const user = await User.findOne({ _id: payload.id });

  if (!user) {
    throw new AppError("User not found", 401);
  }

  req.user = user;
  req.auth = payload;
  next();
});

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError("Forbidden", 403));
  }

  next();
};

export {
  auth,
  authorize
};
