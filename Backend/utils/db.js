import mongoose from "mongoose";
import config from "../config/index.js";

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("MongoDB Connected...");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;
