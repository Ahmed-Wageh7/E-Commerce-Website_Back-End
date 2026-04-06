import express from "express";

import { auth, authorize } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import validateObjectIdParam from "../../middleware/validate-object-id.js";
import asyncHandler from "../../utils/async-handler.js";
import categoriesService from "./categories.service.js";
import { categorySchema } from "./categories.validation.js";

const router = express.Router();

router.get("/", asyncHandler(async (req, res) => {
  res.status(200).json(await categoriesService.getAllCategories());
}));

router.get("/:id/subcategories", validateObjectIdParam("id"), asyncHandler(async (req, res) => {
  res.status(200).json(await categoriesService.getCategorySubcategories(req.params.id));
}));

router.post("/", auth, authorize("admin"), validate(categorySchema), asyncHandler(async (req, res) => {
  res.status(201).json(await categoriesService.createCategory(req.body));
}));

router.put("/:id", auth, authorize("admin"), validateObjectIdParam("id"), validate(categorySchema), asyncHandler(async (req, res) => {
  res.status(200).json(await categoriesService.updateCategory(req.params.id, req.body));
}));

router.delete("/:id", auth, authorize("admin"), validateObjectIdParam("id"), asyncHandler(async (req, res) => {
  res.status(200).json(await categoriesService.deleteCategory(req.params.id));
}));

export default router;
