const getProfile = async (user) => ({ user });

const updateProfile = async (user, payload) => {
  if (payload.name !== undefined) user.name = payload.name;
  if (payload.phone !== undefined) user.phone = payload.phone;
  await user.save();

  return { message: "Profile updated", user };
};

const uploadAvatar = async (user, file) => {
  user.avatar = file ? `/uploads/${file.filename}` : user.avatar;
  await user.save();

  return { message: "Avatar uploaded", avatar: user.avatar };
};

const deleteProfile = async (user) => {
  user.isDeleted = true;
  user.deletedAt = new Date();
  await user.save();

  return { message: "Account soft deleted successfully" };
};

export default {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteProfile
};
