import Stripe from "stripe";
import env from "../../../config/env.service.js";
import Cart from "../../database/model/cart.model.js";
import Order from "../../database/model/order.model.js";
import Product from "../../database/model/product.model.js";
import AppError from "../../utils/app-error.js";
import asyncHandler from "../../utils/async-handler.js";

const stripe = env.stripeSecretKey ? new Stripe(env.stripeSecretKey) : null;

const buildOrderSnapshot = async (cart) => {
  const items = [];
  let totalAmount = 0;

  for (const item of cart.items) {
    const product = await Product.findOne({ _id: item.product._id, isDeleted: false });
    if (!product) throw new AppError(`Product ${item.product._id} not found`, 404);
    if (product.stock < item.quantity) {
      throw new AppError(
        `Insufficient stock for ${product.name}. Available quantity: ${product.stock}`,
        400
      );
    }

    items.push({
      product: product._id,
      quantity: item.quantity,
      price: product.price
    });
    totalAmount += product.price * item.quantity;
  }

  return { items, totalAmount };
};

const applyOrderStock = async (items) => {
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || product.isDeleted) {
      throw new AppError(`Product ${item.product} not found`, 404);
    }

    if (product.stock < item.quantity) {
      throw new AppError(
        `Insufficient stock for ${product.name}. Available quantity: ${product.stock}`,
        400
      );
    }

    product.stock -= item.quantity;
    if (product.stock === 0) {
      product.isDeleted = true;
      product.deletedAt = new Date();
      product.autoDeletedAt = new Date();
    }

    await product.save();
  }
};

const checkout = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  const { items, totalAmount } = await buildOrderSnapshot(cart);

  if (req.body.paymentMethod === "card") {
    const existingPendingOrder = await Order.findOne({
      user: req.user._id,
      paymentMethod: "card",
      paymentStatus: "pending",
      orderStatus: "pending"
    });

    if (existingPendingOrder) {
      existingPendingOrder.items = items;
      existingPendingOrder.totalAmount = totalAmount;
      existingPendingOrder.shippingAddress = req.body.shippingAddress;
      await existingPendingOrder.save();

      return res.status(200).json({
        message: "Pending card order updated. Complete payment to confirm it.",
        order: existingPendingOrder
      });
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      paymentMethod: "card",
      paymentStatus: "pending",
      orderStatus: "pending",
      shippingAddress: req.body.shippingAddress
    });

    return res.status(201).json({
      message: "Card order created. Complete payment to finalize stock deduction.",
      order
    });
  }

  await applyOrderStock(items);

  const order = await Order.create({
    user: req.user._id,
    items,
    totalAmount,
    paymentMethod: req.body.paymentMethod || "cod",
    paymentStatus: "pending",
    orderStatus: "pending",
    shippingAddress: req.body.shippingAddress
  });

  cart.items = [];
  cart.totalAmount = 0;
  await cart.save();

  res.status(201).json({ message: "Order created successfully", order });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate("items.product");
  res.status(200).json({ orders });
});

const getOrderDetails = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).populate(
    "items.product"
  );
  if (!order) throw new AppError("Order not found", 404);
  res.status(200).json({ order });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate("user items.product");
  res.status(200).json({ orders });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { orderStatus: req.body.orderStatus },
    { new: true }
  );
  if (!order) throw new AppError("Order not found", 404);
  res.status(200).json({ message: "Order status updated", order });
});

const createStripeIntent = asyncHandler(async (req, res) => {
  if (!stripe) {
    throw new AppError("Stripe is not configured", 400);
  }

  const order = await Order.findOne({ _id: req.body.orderId, user: req.user._id });
  if (!order) throw new AppError("Order not found", 404);

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalAmount * 100),
    currency: "usd",
    metadata: { orderId: String(order._id) }
  });

  res.status(200).json({ clientSecret: intent.client_secret, paymentIntentId: intent.id });
});

const stripeWebhook = asyncHandler(async (req, res) => {
  if (!stripe) {
    throw new AppError("Stripe is not configured", 400);
  }

  let event = req.body;
  if (env.stripeWebhookSecret && req.rawBody) {
    const signature = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(req.rawBody, signature, env.stripeWebhookSecret);
  }

  if (event.type === "payment_intent.succeeded") {
    const orderId = event.data.object.metadata?.orderId;
    if (orderId) {
      try {
        const order = await Order.findById(orderId);
        if (!order || order.paymentStatus === "paid") {
          return res.status(200).json({ received: true });
        }

        await applyOrderStock(order.items);

        order.paymentStatus = "paid";
        order.orderStatus = "processing";
        await order.save();

        const cart = await Cart.findOne({ user: order.user });
        if (cart) {
          cart.items = [];
          cart.totalAmount = 0;
          await cart.save();
        }
      } catch (error) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: "failed",
          orderStatus: "cancelled"
        });
        throw error;
      }
    }
  }

  res.status(200).json({ received: true });
});

export default {
  checkout,
  getMyOrders,
  getOrderDetails,
  getAllOrders,
  updateOrderStatus,
  createStripeIntent,
  stripeWebhook
};
