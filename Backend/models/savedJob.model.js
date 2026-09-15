import mongoose from "mongoose";

const savedJobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate bookmarks for the same user and job
savedJobSchema.index({ user: 1, job: 1 }, { unique: true });

export const SavedJob = mongoose.model("SavedJob", savedJobSchema);
