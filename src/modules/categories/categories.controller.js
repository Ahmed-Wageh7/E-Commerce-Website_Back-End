import Category from "../../database/model/category.model.js";
import Subcategory from "../../database/model/subcategory.model.js";
import AppError from "../../utils/app-error.js";
import asyncHandler from "../../utils/async-handler.js";

const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ message: "Category created", category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    req.body,
    { new: true }
  );
  if (!category) throw new AppError("Category not found", 404);
  res.status(200).json({ message: "Category updated", category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, isDeleted: false });
  if (!category) throw new AppError("Category not found", 404);

  category.isDeleted = true;
  category.deletedAt = new Date();
  await category.save();

  res.status(200).json({ message: "Category soft deleted" });
});

const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isDeleted: false }).lean();
  const categoryIds = categories.map((category) => category._id);
  const subcategories = await Subcategory.find({
    category: { $in: categoryIds },
    isDeleted: false
  }).lean();

  const response = categories.map((category) => ({
    ...category,
    subcategories: subcategories.filter(
      (subcategory) => String(subcategory.category) === String(category._id)
    )
  }));

  res.status(200).json({ categories: response });
});

const getCategorySubcategories = asyncHandler(async (req, res) => {
  const subcategories = await Subcategory.find({
    category: req.params.id,
    isDeleted: false
  });

  res.status(200).json({ subcategories });
});

export default {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getCategorySubcategories
};
