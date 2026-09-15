import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";

// Admin job posting (Recruiter only)
export const postJob = async (req, res, next) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experience,
      position,
      companyId,
    } = req.body;
    const userId = req.id;

    if (
      !title ||
      !description ||
      !requirements ||
      !salary ||
      !location ||
      !jobType ||
      !experience ||
      !position ||
      !companyId
    ) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
        status: false,
      });
    }

    // Verify company exists and belongs to this recruiter
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        message: "Company not found",
        success: false,
        status: false,
      });
    }

    if (company.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Forbidden: you can only post jobs for companies you own",
        success: false,
        status: false,
      });
    }

    const job = await Job.create({
      title,
      description,
      requirements: Array.isArray(requirements) ? requirements : requirements.split(","),
      salary: Number(salary),
      location,
      jobType,
      experienceLevel: Number(experience),
      position: Number(position),
      company: companyId,
      created_by: userId,
    });

    return res.status(201).json({
      message: "Job posted successfully.",
      job,
      success: true,
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

// Public jobs listing
export const getAllJobs = async (req, res, next) => {
  try {
    const keyword = req.query.keyword || "";
    const query = {
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    };
    const jobs = await Job.find(query)
      .populate({
        path: "company",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      jobs: jobs || [],
      success: true,
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

// Public job by id
export const getJobById = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId).populate({
      path: "applications",
    });
    if (!job) {
      return res.status(404).json({
        message: "Job not found",
        success: false,
        status: false,
      });
    }
    return res.status(200).json({
      job,
      success: true,
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

// Recruiter jobs
export const getAdminJobs = async (req, res, next) => {
  try {
    const adminId = req.id;
    const jobs = await Job.find({ created_by: adminId }).populate({
      path: "company",
      options: { sort: { createdAt: -1 } },
    });

    return res.status(200).json({
      jobs: jobs || [],
      success: true,
      status: true,
    });
  } catch (error) {
    next(error);
  }
};
