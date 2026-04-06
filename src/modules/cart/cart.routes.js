import express from "express";

import { auth } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import validateObjectIdParam from "../../middleware/validate-object-id.js";
import controller from "./cart.controller.js";
import { addToCartSchema, updateCartSchema } from "./cart.validation.js";

const router = express.Router();

router.use(auth);

router.post("/", validate(addToCartSchema), controller.addToCart);
router.get("/", controller.getCart);
router.put("/:productId", validateObjectIdParam("productId"), validate(updateCartSchema), controller.updateCartItem);
router.delete("/:productId", validateObjectIdParam("productId"), controller.removeCartItem);
router.delete("/", controller.clearCart);

export default router;
