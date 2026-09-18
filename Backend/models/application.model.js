import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      index: true,
    },
    recruiterNotes: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    scheduledAt: {
      type: Date,
      default: null,
    },
    meetingLink: {
      type: String,
      trim: true,
      default: "",
    },
    atsScore: {
      type: Number,
      default: null,
      index: true,
    },
    atsDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    atsAnalysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ATSAnalysis",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications via unique compound index at the database layer
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

export const Application = mongoose.model("Application", applicationSchema);
