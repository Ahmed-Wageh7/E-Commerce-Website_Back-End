import express from "express";

import { auth } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import validateObjectIdParam from "../../middleware/validate-object-id.js";
import asyncHandler from "../../utils/async-handler.js";
import cartService from "./cart.service.js";
import { addToCartSchema, updateCartSchema } from "./cart.validation.js";

const router = express.Router();

router.use(auth);

router.post("/", validate(addToCartSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await cartService.addToCart(req.user._id, req.body.productId, req.body.quantity));
}));

router.get("/", asyncHandler(async (req, res) => {
  res.status(200).json(await cartService.getCart(req.user._id));
}));

router.put("/:productId", validateObjectIdParam("productId"), validate(updateCartSchema), asyncHandler(async (req, res) => {
  res.status(200).json(await cartService.updateCartItem(req.user._id, req.params.productId, req.body.quantity));
}));

router.delete("/:productId", validateObjectIdParam("productId"), asyncHandler(async (req, res) => {
  res.status(200).json(await cartService.removeCartItem(req.user._id, req.params.productId));
}));

router.delete("/", asyncHandler(async (req, res) => {
  res.status(200).json(await cartService.clearCart(req.user._id));
}));

export default router;
