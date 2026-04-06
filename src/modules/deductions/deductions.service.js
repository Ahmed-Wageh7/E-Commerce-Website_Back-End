import Deduction from "../../database/model/deduction.model.js";
import Staff from "../../database/model/staff.model.js";
import AppError from "../../utils/app-error.js";

const ensureStaff = async (staffId) => {
  const staff = await Staff.findOne({ _id: staffId, isDeleted: false });
  if (!staff) throw new AppError("Staff member not found", 404);
};

const addDeduction = async (staffId, payload) => {
  await ensureStaff(staffId);
  const deduction = await Deduction.create({ ...payload, staff: staffId });
  return { message: "Deduction added", deduction };
};

const getDeductions = async (staffId) => {
  await ensureStaff(staffId);
  const deductions = await Deduction.find({ staff: staffId });
  return { deductions };
};

const updateDeduction = async (staffId, deductionId, payload) => {
  const deduction = await Deduction.findOneAndUpdate(
    { _id: deductionId, staff: staffId },
    payload,
    { new: true }
  );
  if (!deduction) throw new AppError("Deduction not found", 404);
  return { message: "Deduction updated", deduction };
};

const deleteDeduction = async (staffId, deductionId) => {
  const deduction = await Deduction.findOneAndDelete({
    _id: deductionId,
    staff: staffId
  });
  if (!deduction) throw new AppError("Deduction not found", 404);
  return { message: "Deduction removed" };
};

export default {
  addDeduction,
  getDeductions,
  updateDeduction,
  deleteDeduction
};
