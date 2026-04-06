import Category from "../../database/model/category.model.js";
import Subcategory from "../../database/model/subcategory.model.js";
import AppError from "../../utils/app-error.js";

const createSubcategory = async (payload) => {
  const category = await Category.findOne({ _id: payload.category, isDeleted: false });
  if (!category) throw new AppError("Category not found", 404);

  const subcategory = await Subcategory.create(payload);
  return { message: "Subcategory created", subcategory };
};

const updateSubcategory = async (id, payload) => {
  const subcategory = await Subcategory.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true }
  );
  if (!subcategory) throw new AppError("Subcategory not found", 404);
  return { message: "Subcategory updated", subcategory };
};

const deleteSubcategory = async (id) => {
  const subcategory = await Subcategory.findOne({ _id: id, isDeleted: false });
  if (!subcategory) throw new AppError("Subcategory not found", 404);

  subcategory.isDeleted = true;
  subcategory.deletedAt = new Date();
  await subcategory.save();

  return { message: "Subcategory soft deleted" };
};

const getByCategory = async (categoryId) => {
  const subcategories = await Subcategory.find({
    category: categoryId,
    isDeleted: false
  });
  return { subcategories };
};

const getSubcategoryDetails = async (id) => {
  const subcategory = await Subcategory.findOne({ _id: id, isDeleted: false }).populate(
    "category"
  );
  if (!subcategory) throw new AppError("Subcategory not found", 404);
  return { subcategory };
};

export default {
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getByCategory,
  getSubcategoryDetails
};
