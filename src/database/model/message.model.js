import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["offer", "announcement"],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    discountCode: {
      type: String,
      default: null
    },
    expiresAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
