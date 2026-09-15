import mongoose from "mongoose";
import { SavedJob } from "../models/savedJob.model.js";
import { Job } from "../models/job.model.js";

export const saveJob = async (req, res, next) => {
  try {
    const userId = req.id;
    const jobId = req.params.id;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID format",
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Check if already saved
    const existing = await SavedJob.findOne({ user: userId, job: jobId });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Job is already saved",
        data: { savedJob: existing },
      });
    }

    const savedJob = await SavedJob.create({ user: userId, job: jobId });
    return res.status(201).json({
      success: true,
      message: "Job saved successfully",
      data: { savedJob },
    });
  } catch (error) {
    next(error);
  }
};

export const unsaveJob = async (req, res, next) => {
  try {
    const userId = req.id;
    const jobId = req.params.id;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID format",
      });
    }

    const deleted = await SavedJob.findOneAndDelete({ user: userId, job: jobId });
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Saved job not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job removed from saved list",
    });
  } catch (error) {
    next(error);
  }
};

export const getSavedJobs = async (req, res, next) => {
  try {
    const userId = req.id;
    const savedJobs = await SavedJob.find({ user: userId })
      .populate({
        path: "job",
        populate: { path: "company" },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Saved jobs retrieved successfully",
      data: { savedJobs: savedJobs || [] },
      savedJobs: savedJobs || [],
    });
  } catch (error) {
    next(error);
  }
};
