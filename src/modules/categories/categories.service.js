import Category from "../../database/model/category.model.js";
import Subcategory from "../../database/model/subcategory.model.js";
import AppError from "../../utils/app-error.js";

const createCategory = async (payload) => {
  const category = await Category.create(payload);
  return { message: "Category created", category };
};

const updateCategory = async (id, payload) => {
  const category = await Category.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true }
  );
  if (!category) throw new AppError("Category not found", 404);
  return { message: "Category updated", category };
};

const deleteCategory = async (id) => {
  const category = await Category.findOne({ _id: id, isDeleted: false });
  if (!category) throw new AppError("Category not found", 404);

  category.isDeleted = true;
  category.deletedAt = new Date();
  await category.save();

  return { message: "Category soft deleted" };
};

const getAllCategories = async () => {
  const categories = await Category.find({ isDeleted: false }).lean();
  const categoryIds = categories.map((category) => category._id);
  const subcategories = await Subcategory.find({
    category: { $in: categoryIds },
    isDeleted: false
  }).lean();

  return {
    categories: categories.map((category) => ({
      ...category,
      subcategories: subcategories.filter(
        (subcategory) => String(subcategory.category) === String(category._id)
      )
    }))
  };
};

const getCategorySubcategories = async (id) => {
  const subcategories = await Subcategory.find({
    category: id,
    isDeleted: false
  });

  return { subcategories };
};

export default {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getCategorySubcategories
};
