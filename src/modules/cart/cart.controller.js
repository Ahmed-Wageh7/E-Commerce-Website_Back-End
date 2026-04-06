import Cart from "../../database/model/cart.model.js";
import Product from "../../database/model/product.model.js";
import AppError from "../../utils/app-error.js";
import asyncHandler from "../../utils/async-handler.js";

const calculateTotals = (cart) => {
  cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return cart;
};

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

const addToCart = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.body.productId, isDeleted: false });
  if (!product) throw new AppError("Product not found", 404);
  if (req.body.quantity > product.stock) throw new AppError("Requested quantity exceeds stock", 400);

  const cart = await getOrCreateCart(req.user._id);
  const existingItem = cart.items.find(
    (item) => String(item.product) === String(req.body.productId)
  );

  if (existingItem) {
    const totalQuantity = existingItem.quantity + req.body.quantity;
    if (totalQuantity > product.stock) {
      throw new AppError("Requested quantity exceeds stock", 400);
    }
    existingItem.quantity = totalQuantity;
    existingItem.price = product.price;
  } else {
    cart.items.push({
      product: product._id,
      quantity: req.body.quantity,
      price: product.price
    });
  }

  calculateTotals(cart);
  await cart.save();

  res.status(201).json({ message: "Item added to cart", cart });
});

const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  await cart.populate("items.product");
  res.status(200).json({ cart });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((entry) => String(entry.product) === req.params.productId);
  if (!item) throw new AppError("Item not found in cart", 404);

  const product = await Product.findOne({ _id: req.params.productId, isDeleted: false });
  if (!product) throw new AppError("Product not found", 404);
  if (req.body.quantity > product.stock) throw new AppError("Requested quantity exceeds stock", 400);

  item.quantity = req.body.quantity;
  item.price = product.price;

  calculateTotals(cart);
  await cart.save();

  res.status(200).json({ message: "Cart item updated", cart });
});

const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter((item) => String(item.product) !== req.params.productId);
  calculateTotals(cart);
  await cart.save();

  res.status(200).json({ message: "Cart item removed", cart });
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  cart.totalAmount = 0;
  await cart.save();

  res.status(200).json({ message: "Cart cleared", cart });
});

export default {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart
};
