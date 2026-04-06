import express from "express";

import { auth, authorize } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import validateObjectIdParam from "../../middleware/validate-object-id.js";
import asyncHandler from "../../utils/async-handler.js";
import ordersService from "./orders.service.js";
import { checkoutSchema, updateOrderStatusSchema, stripeIntentSchema } from "./orders.validation.js";

const router = express.Router();

router.post("/orders/checkout", auth, validate(checkoutSchema), asyncHandler(async (req, res) => {
  const result = await ordersService.checkout(req.user._id, req.body);
  res.status(result.statusCode).json(result.body);
}));

router.get("/orders", auth, asyncHandler(async (req, res) => {
  res.status(200).json(await ordersService.getMyOrders(req.user._id));
}));

router.get("/orders/:id", auth, validateObjectIdParam("id"), asyncHandler(async (req, res) => {
  res.status(200).json(await ordersService.getOrderDetails(req.params.id, req.user._id));
}));

router.get("/admin/orders", auth, authorize("admin"), asyncHandler(async (req, res) => {
  res.status(200).json(await ordersService.getAllOrders());
}));

router.patch(
  "/admin/orders/:id/status",
  auth,
  authorize("admin"),
  validateObjectIdParam("id"),
  validate(updateOrderStatusSchema),
  asyncHandler(async (req, res) => {
    res.status(200).json(await ordersService.updateOrderStatus(req.params.id, req.body.orderStatus));
  })
);

router.post("/orders/stripe/payment-intent", auth, validate(stripeIntentSchema), asyncHandler(async (req, res) => {
  res.status(200).json(await ordersService.createStripeIntent(req.body.orderId, req.user._id));
}));

router.post("/orders/stripe/webhook", asyncHandler(async (req, res) => {
  res.status(200).json(
    await ordersService.stripeWebhook(req.body, req.rawBody, req.headers["stripe-signature"])
  );
}));

export default router;
