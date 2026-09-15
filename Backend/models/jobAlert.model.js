import mongoose from "mongoose";

const jobAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    criteria: {
      keyword: { type: String, default: "" },
      location: { type: String, default: "" },
      jobType: { type: String, default: "" },
      minSalary: { type: Number },
      maxSalary: { type: Number },
      experienceLevel: { type: Number },
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly"],
      default: "daily",
    },
    lastSentAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

jobAlertSchema.index({ user: 1, createdAt: -1 });

export const JobAlert = mongoose.model("JobAlert", jobAlertSchema);
