import express from "express";

import { auth } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import imageUpload from "../../middleware/multer.js";
import controller from "./users.controller.js";
import { updateProfileSchema } from "./users.validation.js";

const router = express.Router();

router.use(auth);

router.get("/profile", controller.getProfile);
router.put("/profile", validate(updateProfileSchema), controller.updateProfile);
router.delete("/profile", controller.deleteProfile);
router.post("/upload-avatar", imageUpload.single("avatar"), controller.uploadAvatar);

export default router;
