import express from "express";

import { auth, authorize } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import validateObjectIdParam from "../../middleware/validate-object-id.js";
import controller from "./orders.controller.js";
import { checkoutSchema, updateOrderStatusSchema, stripeIntentSchema } from "./orders.validation.js";

const router = express.Router();

router.post("/orders/checkout", auth, validate(checkoutSchema), controller.checkout);
router.get("/orders", auth, controller.getMyOrders);
router.get("/orders/:id", auth, validateObjectIdParam("id"), controller.getOrderDetails);
router.get("/admin/orders", auth, authorize("admin"), controller.getAllOrders);
router.patch(
  "/admin/orders/:id/status",
  auth,
  authorize("admin"),
  validateObjectIdParam("id"),
  validate(updateOrderStatusSchema),
  controller.updateOrderStatus
);
router.post("/orders/stripe/payment-intent", auth, validate(stripeIntentSchema), controller.createStripeIntent);
router.post("/orders/stripe/webhook", controller.stripeWebhook);

export default router;
