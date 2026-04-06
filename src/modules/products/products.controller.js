import express from "express";

import { auth, authorize } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import validateObjectIdParam from "../../middleware/validate-object-id.js";
import asyncHandler from "../../utils/async-handler.js";
import productsService from "./products.service.js";
import { productSchema, stockSchema } from "./products.validation.js";

const router = express.Router();

router.get("/products", asyncHandler(async (req, res) => {
  res.status(200).json(await productsService.listProducts(req.query));
}));

router.get("/products/category/:categoryId", validateObjectIdParam("categoryId"), asyncHandler(async (req, res) => {
  res.status(200).json(await productsService.getByCategory(req.params.categoryId, req.query));
}));

router.get("/products/subcategory/:subcategoryId", validateObjectIdParam("subcategoryId"), asyncHandler(async (req, res) => {
  res.status(200).json(await productsService.getBySubcategory(req.params.subcategoryId, req.query));
}));

router.get("/products/:id", validateObjectIdParam("id"), asyncHandler(async (req, res) => {
  res.status(200).json(await productsService.getProduct(req.params.id));
}));

router.post("/admin/products", auth, authorize("admin"), validate(productSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await productsService.createProduct(req.body));
}));

router.put("/admin/products/:id", auth, authorize("admin"), validateObjectIdParam("id"), validate(productSchema), asyncHandler(async (req, res) => {
  res.status(200).json(await productsService.updateProduct(req.params.id, req.body));
}));

router.delete("/admin/products/:id", auth, authorize("admin"), validateObjectIdParam("id"), asyncHandler(async (req, res) => {
  res.status(200).json(await productsService.deleteProduct(req.params.id));
}));

router.patch(
  "/admin/products/:id/stock",
  auth,
  authorize("admin"),
  validateObjectIdParam("id"),
  validate(stockSchema),
  asyncHandler(async (req, res) => {
    res.status(200).json(await productsService.updateStock(req.params.id, req.body.stock));
  })
);

export default router;
