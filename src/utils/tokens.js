import crypto from "crypto";
import jwt from "jsonwebtoken";

import env from "../../config/env.service.js";

const createRandomToken = () => crypto.randomBytes(32).toString("hex");

const signAccessToken = (user) =>
  jwt.sign({ id: user._id, role: user.role, email: user.email }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });

const signRefreshToken = (user) =>
  jwt.sign({ id: user._id, role: user.role, email: user.email }, env.jwtRefreshSecret, {
    expiresIn: "7d"
  });

export {
  createRandomToken,
  signAccessToken,
  signRefreshToken
};
