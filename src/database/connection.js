import mongoose from "mongoose";

import env from "../../config/env.service.js";

const connectDB = async () => {
  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected");
};

export default connectDB;
