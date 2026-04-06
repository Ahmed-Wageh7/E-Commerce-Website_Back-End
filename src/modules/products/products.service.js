import Category from "../../database/model/category.model.js";
import Product from "../../database/model/product.model.js";
import Subcategory from "../../database/model/subcategory.model.js";
import AppError from "../../utils/app-error.js";

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

const createProduct = async (payload) => {
  await validateReferences(payload);
  const product = await Product.create(payload);
  if (product.stock === 0) {
    await applyStockSoftDelete(product);
  }
  return { message: "Product created", product };
};

const updateProduct = async (id, payload) => {
  await validateReferences(payload);
  const product = await Product.findOne({ _id: id });
  if (!product) throw new AppError("Product not found", 404);

  Object.assign(product, payload);
  await applyStockSoftDelete(product);

  return { message: "Product updated", product };
};

const deleteProduct = async (id) => {
  const product = await Product.findOne({ _id: id, isDeleted: false });
  if (!product) throw new AppError("Product not found", 404);

  product.isDeleted = true;
  product.deletedAt = new Date();
  await product.save();

  return { message: "Product soft deleted" };
};

const updateStock = async (id, stock) => {
  const product = await Product.findOne({ _id: id });
  if (!product) throw new AppError("Product not found", 404);

  product.stock = stock;
  await applyStockSoftDelete(product);

  return { message: "Stock updated", product };
};

const listProducts = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const filter = getFilter(query);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category subcategory")
      .sort(getSort(query.sort))
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter)
  ]);

  return {
    page,
    limit,
    total,
    products
  };
};

const getProduct = async (id) => {
  const product = await Product.findOne({ _id: id, isDeleted: false }).populate(
    "category subcategory"
  );
  if (!product) throw new AppError("Product not found", 404);
  return { product };
};

const getByCategory = async (categoryId, query) => {
  const products = await Product.find({
    category: categoryId,
    isDeleted: false,
    ...getFilter(query)
  }).sort(getSort(query.sort));

  return { products };
};

const getBySubcategory = async (subcategoryId, query) => {
  const products = await Product.find({
    subcategory: subcategoryId,
    isDeleted: false,
    ...getFilter(query)
  }).sort(getSort(query.sort));

  return { products };
};

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
