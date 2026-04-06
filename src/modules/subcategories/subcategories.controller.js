import Category from "../../database/model/category.model.js";
import Subcategory from "../../database/model/subcategory.model.js";
import AppError from "../../utils/app-error.js";
import asyncHandler from "../../utils/async-handler.js";

const createSubcategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.body.category, isDeleted: false });
  if (!category) throw new AppError("Category not found", 404);

  const subcategory = await Subcategory.create(req.body);
  res.status(201).json({ message: "Subcategory created", subcategory });
});

const updateSubcategory = asyncHandler(async (req, res) => {
  const subcategory = await Subcategory.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    req.body,
    { new: true }
  );
  if (!subcategory) throw new AppError("Subcategory not found", 404);
  res.status(200).json({ message: "Subcategory updated", subcategory });
});

const deleteSubcategory = asyncHandler(async (req, res) => {
  const subcategory = await Subcategory.findOne({ _id: req.params.id, isDeleted: false });
  if (!subcategory) throw new AppError("Subcategory not found", 404);

  subcategory.isDeleted = true;
  subcategory.deletedAt = new Date();
  await subcategory.save();

  res.status(200).json({ message: "Subcategory soft deleted" });
});

const getByCategory = asyncHandler(async (req, res) => {
  const subcategories = await Subcategory.find({
    category: req.params.categoryId,
    isDeleted: false
  });
  res.status(200).json({ subcategories });
});

const getSubcategoryDetails = asyncHandler(async (req, res) => {
  const subcategory = await Subcategory.findOne({ _id: req.params.id, isDeleted: false }).populate(
    "category"
  );
  if (!subcategory) throw new AppError("Subcategory not found", 404);
  res.status(200).json({ subcategory });
});

export default {
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getByCategory,
  getSubcategoryDetails
};
