import express from "express";

import { auth, authorize } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import validateObjectIdParam from "../../middleware/validate-object-id.js";
import controller from "./categories.controller.js";
import { categorySchema } from "./categories.validation.js";

const router = express.Router();

router.get("/", controller.getAllCategories);
router.get("/:id/subcategories", validateObjectIdParam("id"), controller.getCategorySubcategories);
router.post("/", auth, authorize("admin"), validate(categorySchema), controller.createCategory);
router.put(
  "/:id",
  auth,
  authorize("admin"),
  validateObjectIdParam("id"),
  validate(categorySchema),
  controller.updateCategory
);
router.delete("/:id", auth, authorize("admin"), validateObjectIdParam("id"), controller.deleteCategory);

export default router;
