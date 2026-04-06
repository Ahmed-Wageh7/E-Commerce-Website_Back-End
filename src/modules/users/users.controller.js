import asyncHandler from "../../utils/async-handler.js";

const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ user: req.user });
});

const updateProfile = asyncHandler(async (req, res) => {
  if (req.body.name !== undefined) req.user.name = req.body.name;
  if (req.body.phone !== undefined) req.user.phone = req.body.phone;
  await req.user.save();

  res.status(200).json({ message: "Profile updated", user: req.user });
});

const uploadAvatar = asyncHandler(async (req, res) => {
  req.user.avatar = req.file ? `/uploads/${req.file.filename}` : req.user.avatar;
  await req.user.save();

  res.status(200).json({ message: "Avatar uploaded", avatar: req.user.avatar });
});

const deleteProfile = asyncHandler(async (req, res) => {
  req.user.isDeleted = true;
  req.user.deletedAt = new Date();
  await req.user.save();

  res.status(200).json({ message: "Account soft deleted successfully" });
});

export default {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteProfile
};
