import Stripe from "stripe";
import env from "../../../config/env.service.js";
import Cart from "../../database/model/cart.model.js";
import Order from "../../database/model/order.model.js";
import Product from "../../database/model/product.model.js";
import AppError from "../../utils/app-error.js";

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

const checkout = async (userId, payload) => {
  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  const { items, totalAmount } = await buildOrderSnapshot(cart);

  if (payload.paymentMethod === "card") {
    const existingPendingOrder = await Order.findOne({
      user: userId,
      paymentMethod: "card",
      paymentStatus: "pending",
      orderStatus: "pending"
    });

    if (existingPendingOrder) {
      existingPendingOrder.items = items;
      existingPendingOrder.totalAmount = totalAmount;
      existingPendingOrder.shippingAddress = payload.shippingAddress;
      await existingPendingOrder.save();

      return {
        statusCode: 200,
        body: {
          message: "Pending card order updated. Complete payment to confirm it.",
          order: existingPendingOrder
        }
      };
    }

    const order = await Order.create({
      user: userId,
      items,
      totalAmount,
      paymentMethod: "card",
      paymentStatus: "pending",
      orderStatus: "pending",
      shippingAddress: payload.shippingAddress
    });

    return {
      statusCode: 201,
      body: {
        message: "Card order created. Complete payment to finalize stock deduction.",
        order
      }
    };
  }

  await applyOrderStock(items);

  const order = await Order.create({
    user: userId,
    items,
    totalAmount,
    paymentMethod: payload.paymentMethod || "cod",
    paymentStatus: "pending",
    orderStatus: "pending",
    shippingAddress: payload.shippingAddress
  });

  cart.items = [];
  cart.totalAmount = 0;
  await cart.save();

  return {
    statusCode: 201,
    body: { message: "Order created successfully", order }
  };
};

const getMyOrders = async (userId) => {
  const orders = await Order.find({ user: userId }).populate("items.product");
  return { orders };
};

const getOrderDetails = async (id, userId) => {
  const order = await Order.findOne({ _id: id, user: userId }).populate("items.product");
  if (!order) throw new AppError("Order not found", 404);
  return { order };
};

const getAllOrders = async () => {
  const orders = await Order.find().populate("user items.product");
  return { orders };
};

const updateOrderStatus = async (id, orderStatus) => {
  const order = await Order.findByIdAndUpdate(id, { orderStatus }, { new: true });
  if (!order) throw new AppError("Order not found", 404);
  return { message: "Order status updated", order };
};

const createStripeIntent = async (orderId, userId) => {
  if (!stripe) {
    throw new AppError("Stripe is not configured", 400);
  }

  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) throw new AppError("Order not found", 404);

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalAmount * 100),
    currency: "usd",
    metadata: { orderId: String(order._id) }
  });

  return { clientSecret: intent.client_secret, paymentIntentId: intent.id };
};

const stripeWebhook = async (body, rawBody, signature) => {
  if (!stripe) {
    throw new AppError("Stripe is not configured", 400);
  }

  let event = body;
  if (env.stripeWebhookSecret && rawBody) {
    event = stripe.webhooks.constructEvent(rawBody, signature, env.stripeWebhookSecret);
  }

  if (event.type === "payment_intent.succeeded") {
    const orderId = event.data.object.metadata?.orderId;
    if (orderId) {
      try {
        const order = await Order.findById(orderId);
        if (!order || order.paymentStatus === "paid") {
          return { received: true };
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

  return { received: true };
};

export default {
  checkout,
  getMyOrders,
  getOrderDetails,
  getAllOrders,
  updateOrderStatus,
  createStripeIntent,
  stripeWebhook
};
