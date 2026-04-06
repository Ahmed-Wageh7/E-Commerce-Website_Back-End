import Attendance from "../../database/model/attendance.model.js";
import Staff from "../../database/model/staff.model.js";
import AppError from "../../utils/app-error.js";

const getToday = () => new Date().toISOString().slice(0, 10);

const markMissedCheckoutsAsAbsent = async (staffId, today) => {
  await Attendance.updateMany(
    {
      staff: staffId,
      date: { $lt: today },
      checkOut: null,
      status: "present"
    },
    {
      status: "absent",
      workingHours: 0,
      deductionAmount: 0
    }
  );
};

const getActiveStaff = async (userId) => {
  const staff = await Staff.findOne({ user: userId, isDeleted: false, isActive: true });
  if (!staff) throw new AppError("Staff record not found", 404);
  return staff;
};

const checkIn = async (userId) => {
  const staff = await getActiveStaff(userId);

  const date = getToday();
  await markMissedCheckoutsAsAbsent(staff._id, date);
  const exists = await Attendance.findOne({ staff: staff._id, date });
  if (exists) throw new AppError("You already checked in today", 400);

  const now = new Date();
  const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 0);

  const attendance = await Attendance.create({
    staff: staff._id,
    date,
    checkIn: now,
    isLate
  });

  return { message: "Checked in successfully", attendance };
};

const checkOut = async (userId) => {
  const staff = await getActiveStaff(userId);

  const date = getToday();
  await markMissedCheckoutsAsAbsent(staff._id, date);
  const attendance = await Attendance.findOne({ staff: staff._id, date });
  if (!attendance) throw new AppError("Check-in record not found", 404);
  if (attendance.checkOut) throw new AppError("You already checked out today", 400);

  attendance.checkOut = new Date();
  attendance.workingHours =
    (attendance.checkOut.getTime() - attendance.checkIn.getTime()) / (1000 * 60 * 60);

  if (attendance.workingHours < 8) {
    const missingHours = 8 - attendance.workingHours;
    attendance.deductionAmount = Number(((missingHours / 8) * staff.dailySalary).toFixed(2));
  }

  await attendance.save();

  return { message: "Checked out successfully", attendance };
};

export default {
  checkIn,
  checkOut
};
