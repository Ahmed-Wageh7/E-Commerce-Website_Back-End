import Deduction from "../../database/model/deduction.model.js";
import Staff from "../../database/model/staff.model.js";
import AppError from "../../utils/app-error.js";
import asyncHandler from "../../utils/async-handler.js";

const ensureStaff = async (staffId) => {
  const staff = await Staff.findOne({ _id: staffId, isDeleted: false });
  if (!staff) throw new AppError("Staff member not found", 404);
};

const addDeduction = asyncHandler(async (req, res) => {
  await ensureStaff(req.params.id);
  const deduction = await Deduction.create({ ...req.body, staff: req.params.id });
  res.status(201).json({ message: "Deduction added", deduction });
});

const getDeductions = asyncHandler(async (req, res) => {
  await ensureStaff(req.params.id);
  const deductions = await Deduction.find({ staff: req.params.id });
  res.status(200).json({ deductions });
});

const updateDeduction = asyncHandler(async (req, res) => {
  const deduction = await Deduction.findOneAndUpdate(
    { _id: req.params.deductionId, staff: req.params.id },
    req.body,
    { new: true }
  );
  if (!deduction) throw new AppError("Deduction not found", 404);
  res.status(200).json({ message: "Deduction updated", deduction });
});

const deleteDeduction = asyncHandler(async (req, res) => {
  const deduction = await Deduction.findOneAndDelete({
    _id: req.params.deductionId,
    staff: req.params.id
  });
  if (!deduction) throw new AppError("Deduction not found", 404);
  res.status(200).json({ message: "Deduction removed" });
});

export default {
  addDeduction,
  getDeductions,
  updateDeduction,
  deleteDeduction
};
