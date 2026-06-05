import mongoose from "mongoose";
import { DB_URL } from "../config/env.js";

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URL);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.log("MongoDB Connection Error:", error.message)
  }
};

export default connectDB;