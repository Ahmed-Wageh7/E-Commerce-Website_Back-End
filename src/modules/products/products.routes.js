import express from "express";

import { auth, authorize } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import validateObjectIdParam from "../../middleware/validate-object-id.js";
import controller from "./products.controller.js";
import { productSchema, stockSchema } from "./products.validation.js";

const router = express.Router();

router.get("/products", controller.listProducts);
router.get("/products/category/:categoryId", validateObjectIdParam("categoryId"), controller.getByCategory);
router.get(
  "/products/subcategory/:subcategoryId",
  validateObjectIdParam("subcategoryId"),
  controller.getBySubcategory
);
router.get("/products/:id", validateObjectIdParam("id"), controller.getProduct);
router.post("/admin/products", auth, authorize("admin"), validate(productSchema), controller.createProduct);
router.put(
  "/admin/products/:id",
  auth,
  authorize("admin"),
  validateObjectIdParam("id"),
  validate(productSchema),
  controller.updateProduct
);
router.delete("/admin/products/:id", auth, authorize("admin"), validateObjectIdParam("id"), controller.deleteProduct);
router.patch(
  "/admin/products/:id/stock",
  auth,
  authorize("admin"),
  validateObjectIdParam("id"),
  validate(stockSchema),
  controller.updateStock
);

export default router;
