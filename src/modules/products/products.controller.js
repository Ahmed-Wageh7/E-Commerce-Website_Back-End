import Category from "../../database/model/category.model.js";
import Product from "../../database/model/product.model.js";
import Subcategory from "../../database/model/subcategory.model.js";
import AppError from "../../utils/app-error.js";
import asyncHandler from "../../utils/async-handler.js";

const getFilter = (query) => {
  const filter = { isDeleted: false };

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  return filter;
};

const getSort = (sort) => {
  const options = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    createdAt: { createdAt: -1 },
    name: { name: 1 }
  };

  return options[sort] || { createdAt: -1 };
};

const validateReferences = async ({ category, subcategory }) => {
  const foundCategory = await Category.findOne({ _id: category, isDeleted: false });
  if (!foundCategory) throw new AppError("Category not found", 404);

  const foundSubcategory = await Subcategory.findOne({
    _id: subcategory,
    category,
    isDeleted: false
  });
  if (!foundSubcategory) throw new AppError("Subcategory not found in selected category", 404);
};

const applyStockSoftDelete = async (product) => {
  if (product.stock === 0) {
    product.isDeleted = true;
    product.deletedAt = new Date();
    product.autoDeletedAt = new Date();
  } else {
    product.isDeleted = false;
    product.deletedAt = null;
    product.autoDeletedAt = null;
  }
  await product.save();
};

const createProduct = asyncHandler(async (req, res) => {
  await validateReferences(req.body);
  const product = await Product.create(req.body);
  if (product.stock === 0) {
    await applyStockSoftDelete(product);
  }
  res.status(201).json({ message: "Product created", product });
});

const updateProduct = asyncHandler(async (req, res) => {
  await validateReferences(req.body);
  const product = await Product.findOne({ _id: req.params.id });
  if (!product) throw new AppError("Product not found", 404);

  Object.assign(product, req.body);
  await applyStockSoftDelete(product);

  res.status(200).json({ message: "Product updated", product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isDeleted: false });
  if (!product) throw new AppError("Product not found", 404);

  product.isDeleted = true;
  product.deletedAt = new Date();
  await product.save();

  res.status(200).json({ message: "Product soft deleted" });
});

const updateStock = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id });
  if (!product) throw new AppError("Product not found", 404);

  product.stock = req.body.stock;
  await applyStockSoftDelete(product);

  res.status(200).json({ message: "Stock updated", product });
});

const listProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const filter = getFilter(req.query);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category subcategory")
      .sort(getSort(req.query.sort))
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter)
  ]);

  res.status(200).json({
    page,
    limit,
    total,
    products
  });
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isDeleted: false }).populate(
    "category subcategory"
  );
  if (!product) throw new AppError("Product not found", 404);
  res.status(200).json({ product });
});

const getByCategory = asyncHandler(async (req, res) => {
  const products = await Product.find({
    category: req.params.categoryId,
    isDeleted: false,
    ...getFilter(req.query)
  }).sort(getSort(req.query.sort));

  res.status(200).json({ products });
});

const getBySubcategory = asyncHandler(async (req, res) => {
  const products = await Product.find({
    subcategory: req.params.subcategoryId,
    isDeleted: false,
    ...getFilter(req.query)
  }).sort(getSort(req.query.sort));

  res.status(200).json({ products });
});

export default {
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  listProducts,
  getProduct,
  getByCategory,
  getBySubcategory
};
