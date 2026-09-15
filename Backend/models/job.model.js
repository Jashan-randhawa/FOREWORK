import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    salary: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    experienceLevel: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    jobType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    position: {
      type: Number,
      required: true,
      min: 1,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "paused", "expired", "closed"],
      default: "published",
      index: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    applications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
      },
    ],
  },
  { timestamps: true }
);

// Search & Performance Indexes
jobSchema.index({ title: "text", description: "text" });
jobSchema.index({ company: 1, createdAt: -1 });
jobSchema.index({ created_by: 1, createdAt: -1 });
jobSchema.index({ createdAt: -1 });

export const Job = mongoose.model("Job", jobSchema);
