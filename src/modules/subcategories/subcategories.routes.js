import express from "express";

import { auth, authorize } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import validateObjectIdParam from "../../middleware/validate-object-id.js";
import controller from "./subcategories.controller.js";
import { subcategorySchema } from "./subcategories.validation.js";

const router = express.Router();

router.post("/", auth, authorize("admin"), validate(subcategorySchema), controller.createSubcategory);
router.put(
  "/:id",
  auth,
  authorize("admin"),
  validateObjectIdParam("id"),
  validate(subcategorySchema),
  controller.updateSubcategory
);
router.delete("/:id", auth, authorize("admin"), validateObjectIdParam("id"), controller.deleteSubcategory);
router.get("/:id", validateObjectIdParam("id"), controller.getSubcategoryDetails);

export default router;
