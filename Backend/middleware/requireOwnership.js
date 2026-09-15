import mongoose from "mongoose";
import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";

export const requireCompanyOwnership = async (req, res, next) => {
  try {
    const companyId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({
        message: "Invalid company ID format",
        success: false,
      });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        message: "Company not found",
        success: false,
      });
    }

    if (company.userId.toString() !== req.id.toString()) {
      return res.status(403).json({
        message: "Forbidden: you do not have permission to access or modify this company",
        success: false,
      });
    }

    req.company = company;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireJobOwnership = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        message: "Invalid job ID format",
        success: false,
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        message: "Job not found",
        success: false,
      });
    }

    if (job.created_by.toString() !== req.id.toString()) {
      return res.status(403).json({
        message: "Forbidden: you do not have permission to view applicants for this job",
        success: false,
      });
    }

    req.job = job;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireApplicationOwnership = async (req, res, next) => {
  try {
    const applicationId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        message: "Invalid application ID format",
        success: false,
      });
    }

    const application = await Application.findById(applicationId).populate("job");
    if (!application) {
      return res.status(404).json({
        message: "Application not found",
        success: false,
      });
    }

    if (!application.job || application.job.created_by.toString() !== req.id.toString()) {
      return res.status(403).json({
        message: "Forbidden: you do not own the job associated with this application",
        success: false,
      });
    }

    req.application = application;
    next();
  } catch (error) {
    next(error);
  }
};
