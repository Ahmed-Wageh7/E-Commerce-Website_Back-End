import Attendance from "../../database/model/attendance.model.js";
import Deduction from "../../database/model/deduction.model.js";
import Staff from "../../database/model/staff.model.js";
import User from "../../database/model/user.model.js";
import AppError from "../../utils/app-error.js";
import asyncHandler from "../../utils/async-handler.js";

const buildSalarySummary = (staff, attendances, deductions, month) => {
  const totalDaysWorked = attendances.filter((entry) => entry.status === "present").length;
  const lateDays = attendances.filter((entry) => entry.isLate).length;
  const absentDays = attendances.filter(
    (entry) => entry.status === "absent" || !entry.checkOut
  ).length;
  const [year, monthNumber] = month.split("-").map(Number);
  const workingDays = new Date(year, monthNumber, 0).getDate();

  const baseSalary = staff.dailySalary * workingDays;
  const lateDeductions = lateDays * staff.dailySalary * 0.1;
  const absentDeductions = absentDays * staff.dailySalary;
  const manualDeductions = deductions.reduce((sum, entry) => sum + entry.amount, 0);
  const totalDeductions = lateDeductions + absentDeductions + manualDeductions;
  const existingReport = staff.monthlyReports.find((entry) => entry.month === month);
  const adjustmentAmount = existingReport?.adjustmentAmount || 0;
  const finalSalary = Math.max(baseSalary - totalDeductions + adjustmentAmount, 0);

  return {
    month,
    baseSalary,
    totalDaysWorked,
    lateDays,
    absentDays,
    totalDeductions,
    adjustmentAmount,
    finalSalary
  };
};

const createStaff = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.body.user, isDeleted: false });
  if (!user) throw new AppError("User not found", 404);

  user.role = "staff";
  await user.save();

  const staff = await Staff.create(req.body);
  res.status(201).json({ message: "Staff member created", staff });
});

const getAllStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.find({ isDeleted: false }).populate("user");
  res.status(200).json({ staff });
});

const getStaffDetails = asyncHandler(async (req, res) => {
  const staff = await Staff.findOne({ _id: req.params.id, isDeleted: false }).populate("user");
  if (!staff) throw new AppError("Staff member not found", 404);
  res.status(200).json({ staff });
});

const updateStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    req.body,
    { new: true }
  );
  if (!staff) throw new AppError("Staff member not found", 404);
  res.status(200).json({ message: "Staff updated", staff });
});

const deleteStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.findOne({ _id: req.params.id, isDeleted: false });
  if (!staff) throw new AppError("Staff member not found", 404);

  staff.isDeleted = true;
  staff.deletedAt = new Date();
  staff.isActive = false;
  await staff.save();

  res.status(200).json({ message: "Staff soft deleted" });
});

const calculateSalary = asyncHandler(async (req, res) => {
  const staff = await Staff.findOne({ _id: req.params.id, isDeleted: false });
  if (!staff) throw new AppError("Staff member not found", 404);

  const month = req.params.month;
  const attendances = await Attendance.find({
    staff: staff._id,
    date: { $regex: `^${month}` }
  });
  const deductions = await Deduction.find({ staff: staff._id, month });
  const summary = buildSalarySummary(staff, attendances, deductions, month);

  res.status(200).json(summary);
});

const markSalaryPaid = asyncHandler(async (req, res) => {
  const staff = await Staff.findOne({ _id: req.params.id, isDeleted: false });
  if (!staff) throw new AppError("Staff member not found", 404);

  const reportIndex = staff.monthlyReports.findIndex((entry) => entry.month === req.params.month);
  const summary = await Attendance.find({
    staff: staff._id,
    date: { $regex: `^${req.params.month}` }
  });
  const deductions = await Deduction.find({ staff: staff._id, month: req.params.month });
  const salarySummary = buildSalarySummary(staff, summary, deductions, req.params.month);

  const payload = {
    month: req.params.month,
    totalDaysWorked: salarySummary.totalDaysWorked,
    totalDeductions: salarySummary.totalDeductions,
    adjustmentAmount: salarySummary.adjustmentAmount,
    finalSalary: salarySummary.finalSalary,
    isPaid: true,
    paidAt: new Date()
  };

  if (reportIndex >= 0) {
    staff.monthlyReports[reportIndex] = payload;
  } else {
    staff.monthlyReports.push(payload);
  }

  await staff.save();
  res.status(200).json({ message: "Salary marked as paid", report: payload });
});

const adjustSalary = asyncHandler(async (req, res) => {
  const staff = await Staff.findOne({ _id: req.params.id, isDeleted: false });
  if (!staff) throw new AppError("Staff member not found", 404);

  const month = req.params.month;
  const reportIndex = staff.monthlyReports.findIndex((entry) => entry.month === month);
  const previousAdjustment = reportIndex === -1 ? 0 : staff.monthlyReports[reportIndex].adjustmentAmount || 0;
  const updatedAdjustment = previousAdjustment + req.body.finalSalary;
  const attendances = await Attendance.find({
    staff: staff._id,
    date: { $regex: `^${month}` }
  });
  const deductions = await Deduction.find({ staff: staff._id, month });

  if (reportIndex >= 0) {
    staff.monthlyReports[reportIndex].adjustmentAmount = updatedAdjustment;
  } else {
    staff.monthlyReports.push({
      month,
      totalDaysWorked: 0,
      totalDeductions: 0,
      adjustmentAmount: updatedAdjustment,
      finalSalary: 0,
      isPaid: false
    });
  }

  const salarySummary = buildSalarySummary(staff, attendances, deductions, month);

  if (reportIndex === -1) {
    staff.monthlyReports[staff.monthlyReports.length - 1].totalDaysWorked = salarySummary.totalDaysWorked;
    staff.monthlyReports[staff.monthlyReports.length - 1].totalDeductions = salarySummary.totalDeductions;
    staff.monthlyReports[staff.monthlyReports.length - 1].finalSalary = salarySummary.finalSalary;
  } else {
    staff.monthlyReports[reportIndex].totalDaysWorked = salarySummary.totalDaysWorked;
    staff.monthlyReports[reportIndex].totalDeductions = salarySummary.totalDeductions;
    staff.monthlyReports[reportIndex].finalSalary = salarySummary.finalSalary;
  }

  await staff.save();
  res.status(200).json({
    message: "Salary adjusted successfully",
    report: staff.monthlyReports[reportIndex === -1 ? staff.monthlyReports.length - 1 : reportIndex]
  });
});

export default {
  createStaff,
  getAllStaff,
  getStaffDetails,
  updateStaff,
  deleteStaff,
  calculateSalary,
  markSalaryPaid,
  adjustSalary
};
