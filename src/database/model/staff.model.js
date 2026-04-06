import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    dailySalary: {
      type: Number,
      required: true,
      min: 0
    },
    joinDate: {
      type: Date,
      required: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    monthlyReports: [
      {
        month: String,
        totalDaysWorked: Number,
        totalDeductions: Number,
        adjustmentAmount: {
          type: Number,
          default: 0
        },
        finalSalary: Number,
        isPaid: {
          type: Boolean,
          default: false
        },
        paidAt: Date
      }
    ],
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model("Staff", staffSchema);
