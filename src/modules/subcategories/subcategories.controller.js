import express from "express";

import { auth, authorize } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import validateObjectIdParam from "../../middleware/validate-object-id.js";
import asyncHandler from "../../utils/async-handler.js";
import subcategoriesService from "./subcategories.service.js";
import { subcategorySchema } from "./subcategories.validation.js";

const router = express.Router();

router.post("/", auth, authorize("admin"), validate(subcategorySchema), asyncHandler(async (req, res) => {
  res.status(201).json(await subcategoriesService.createSubcategory(req.body));
}));

router.put("/:id", auth, authorize("admin"), validateObjectIdParam("id"), validate(subcategorySchema), asyncHandler(async (req, res) => {
  res.status(200).json(await subcategoriesService.updateSubcategory(req.params.id, req.body));
}));

router.delete("/:id", auth, authorize("admin"), validateObjectIdParam("id"), asyncHandler(async (req, res) => {
  res.status(200).json(await subcategoriesService.deleteSubcategory(req.params.id));
}));

router.get("/:id", validateObjectIdParam("id"), asyncHandler(async (req, res) => {
  res.status(200).json(await subcategoriesService.getSubcategoryDetails(req.params.id));
}));

export default router;
