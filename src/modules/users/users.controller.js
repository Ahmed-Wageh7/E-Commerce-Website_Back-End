import express from "express";

import { auth } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import imageUpload from "../../middleware/multer.js";
import asyncHandler from "../../utils/async-handler.js";
import usersService from "./users.service.js";
import { updateProfileSchema } from "./users.validation.js";

const router = express.Router();

router.use(auth);

router.get("/profile", asyncHandler(async (req, res) => {
  res.status(200).json(await usersService.getProfile(req.user));
}));

router.put("/profile", validate(updateProfileSchema), asyncHandler(async (req, res) => {
  res.status(200).json(await usersService.updateProfile(req.user, req.body));
}));

router.delete("/profile", asyncHandler(async (req, res) => {
  res.status(200).json(await usersService.deleteProfile(req.user));
}));

router.post("/upload-avatar", imageUpload.single("avatar"), asyncHandler(async (req, res) => {
  res.status(200).json(await usersService.uploadAvatar(req.user, req.file));
}));

export default router;
