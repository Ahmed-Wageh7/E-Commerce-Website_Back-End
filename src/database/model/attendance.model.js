import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
      index: true
    },
    date: {
      type: String,
      required: true,
      index: true
    },
    checkIn: {
      type: Date,
      required: true
    },
    checkOut: {
      type: Date,
      default: null
    },
    isLate: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["present", "absent"],
      default: "present"
    },
    workingHours: {
      type: Number,
      default: 0
    },
    deductionAmount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

attendanceSchema.index({ staff: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
