import mongoose from "mongoose";
import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { Application } from "../models/application.model.js";

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
      status = "published",
    } = req.body;
    const userId = req.id;

    const validStatuses = ["draft", "published", "paused", "expired", "closed"];
    const jobStatus = status.toLowerCase();
    if (!validStatuses.includes(jobStatus)) {
      return res.status(400).json({
        message: `Invalid status. Allowed values: ${validStatuses.join(", ")}`,
        success: false,
        status: false,
      });
    }

    if (
      !title ||
      !description ||
      !requirements ||
      salary === undefined ||
      !location ||
      !jobType ||
      experience === undefined ||
      position === undefined ||
      !companyId
    ) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
        status: false,
      });
    }

    const numSalary = Number(salary);
    const numExperience = Number(experience);
    const numPosition = Number(position);

    if (isNaN(numSalary) || numSalary < 0) {
      return res.status(400).json({
        message: "Salary must be a valid positive number",
        success: false,
        status: false,
      });
    }

    if (isNaN(numExperience) || numExperience < 0) {
      return res.status(400).json({
        message: "Experience must be a valid non-negative number",
        success: false,
        status: false,
      });
    }

    if (isNaN(numPosition) || numPosition < 1) {
      return res.status(400).json({
        message: "Position count must be at least 1",
        success: false,
        status: false,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({
        message: "Invalid company ID format",
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
      title: title.trim(),
      description: description.trim(),
      requirements: Array.isArray(requirements)
        ? requirements
        : requirements.split(",").map((r) => r.trim()).filter(Boolean),
      salary: numSalary,
      location: location.trim(),
      jobType: jobType.trim(),
      experienceLevel: numExperience,
      position: numPosition,
      company: companyId,
      created_by: userId,
      status: jobStatus,
    });

    return res.status(201).json({
      success: true,
      message: "Job posted successfully.",
      data: { job },
      job,
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

// Public jobs listing with structured filters and pagination (JOB-011, JOB-013, API-001)
export const getAllJobs = async (req, res, next) => {
  try {
    const {
      keyword,
      location,
      jobType,
      experienceMin,
      experienceMax,
      salaryMin,
      salaryMax,
      page = 1,
      limit = 10,
      sort = "latest",
      sortBy,
      status,
      fields,
    } = req.query;

    const query = {};

    // Public listings show published jobs unless explicit status is requested
    if (status) {
      query.status = status.toLowerCase();
    } else {
      query.status = { $in: ["published", null] };
    }

    // Keyword search across title and description
    if (keyword && keyword.trim()) {
      const cleanKeyword = keyword.trim();
      query.$or = [
        { title: { $regex: cleanKeyword, $options: "i" } },
        { description: { $regex: cleanKeyword, $options: "i" } },
        { requirements: { $regex: cleanKeyword, $options: "i" } },
      ];
    }

    // Location filter
    if (location && location.trim()) {
      query.location = { $regex: location.trim(), $options: "i" };
    }

    // Job Type filter
    if (jobType && jobType.trim()) {
      query.jobType = { $regex: jobType.trim(), $options: "i" };
    }

    // Experience range filter
    if (experienceMin !== undefined && experienceMin !== "" || experienceMax !== undefined && experienceMax !== "") {
      query.experienceLevel = {};
      if (experienceMin !== undefined && experienceMin !== "" && !isNaN(Number(experienceMin))) {
        query.experienceLevel.$gte = Number(experienceMin);
      }
      if (experienceMax !== undefined && experienceMax !== "" && !isNaN(Number(experienceMax))) {
        query.experienceLevel.$lte = Number(experienceMax);
      }
    }

    // Salary range filter
    if (salaryMin !== undefined && salaryMin !== "" || salaryMax !== undefined && salaryMax !== "") {
      query.salary = {};
      if (salaryMin !== undefined && salaryMin !== "" && !isNaN(Number(salaryMin))) {
        query.salary.$gte = Number(salaryMin);
      }
      if (salaryMax !== undefined && salaryMax !== "" && !isNaN(Number(salaryMax))) {
        query.salary.$lte = Number(salaryMax);
      }
    }

    // Pagination numbers
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const effectiveSort = sortBy || sort;
    let sortObj = { createdAt: -1 };
    if (effectiveSort === "salary" || effectiveSort === "salary_desc") {
      sortObj = { salary: -1, createdAt: -1 };
    } else if (effectiveSort === "salary_asc") {
      sortObj = { salary: 1, createdAt: -1 };
    } else if (effectiveSort === "experience_asc") {
      sortObj = { experienceLevel: 1, createdAt: -1 };
    } else if (effectiveSort === "oldest") {
      sortObj = { createdAt: 1 };
    } else if (effectiveSort === "newest" || effectiveSort === "latest" || effectiveSort === "relevance") {
      sortObj = { createdAt: -1 };
    }

    const total = await Job.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum) || 1;

    let jobQuery = Job.find(query);
    if (fields && typeof fields === "string") {
      const selectedFields = fields
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean)
        .join(" ");
      if (selectedFields) {
        jobQuery = jobQuery.select(selectedFields);
      }
    }

    const jobs = await jobQuery
      .populate({
        path: "company",
      })
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    const pagination = {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasMore: pageNum < totalPages,
    };

    return res.status(200).json({
      success: true,
      message: "Jobs fetched successfully",
      data: {
        jobs: jobs || [],
        pagination,
      },
      // Backward compatibility aliases
      jobs: jobs || [],
      pagination,
      total,
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

// Public job by id with populated company & applications (JOB-014, API-001)
export const getJobById = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        message: "Invalid job ID format",
        success: false,
        status: false,
      });
    }

    const job = await Job.findById(jobId)
      .populate({
        path: "company",
      })
      .populate({
        path: "applications",
      });

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
        success: false,
        status: false,
      });
    }

    // Increment views counter
    await Job.findByIdAndUpdate(jobId, { $inc: { views: 1 } });

    return res.status(200).json({
      success: true,
      message: "Job fetched successfully",
      data: { job },
      job,
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

// Recruiter jobs with pagination
export const getAdminJobs = async (req, res, next) => {
  try {
    const adminId = req.id;
    const { status, fields } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const query = { created_by: adminId };
    if (status) {
      query.status = status.toLowerCase();
    }
    const total = await Job.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;

    let jobQuery = Job.find(query);
    if (fields && typeof fields === "string") {
      const selectedFields = fields
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean)
        .join(" ");
      if (selectedFields) {
        jobQuery = jobQuery.select(selectedFields);
      }
    }

    const jobs = await jobQuery
      .populate({
        path: "company",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const pagination = {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    };

    return res.status(200).json({
      success: true,
      message: "Recruiter jobs fetched successfully",
      data: {
        jobs: jobs || [],
        pagination,
      },
      jobs: jobs || [],
      pagination,
      total,
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

// Recruiter updates job status (EMP-002)
export const updateJobStatus = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const validStatuses = ["draft", "published", "paused", "expired", "closed"];
    const normalizedStatus = status.toLowerCase();
    if (!validStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(", ")}`,
      });
    }

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

    if (job.created_by.toString() !== req.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: you do not have permission to modify this job",
      });
    }

    job.status = normalizedStatus;
    await job.save();

    return res.status(200).json({
      success: true,
      message: `Job status updated to ${normalizedStatus}`,
      data: { job },
      job,
    });
  } catch (error) {
    next(error);
  }
};

// Per-job aggregation statistics (ANALYTICS-001)
export const getJobStats = async (req, res, next) => {
  try {
    const jobId = req.params.id;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID format",
      });
    }

    const job = await Job.findById(jobId).populate("company", "name logo");
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Role & ownership check: Requester must be creator of the job or Admin
    const isOwner = job.created_by.toString() === req.id.toString();
    const isAdmin = req.user?.role === "Admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to view stats for this job",
      });
    }

    const totalViews = job.views || 0;
    const totalApplications = await Application.countDocuments({ job: jobId });
    const conversionRate =
      totalViews > 0
        ? Number(((totalApplications / totalViews) * 100).toFixed(2))
        : 0;

    // Status breakdown via aggregation
    const statusGroups = await Application.aggregate([
      { $match: { job: new mongoose.Types.ObjectId(jobId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const statusBreakdown = {
      pending: 0,
      accepted: 0,
      rejected: 0,
    };
    statusGroups.forEach((g) => {
      if (g._id) {
        statusBreakdown[g._id.toLowerCase()] = g.count;
      }
    });

    // 30-day timeline of applications
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const timelineGroups = await Application.aggregate([
      {
        $match: {
          job: new mongoose.Types.ObjectId(jobId),
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const applicationsTimeline = timelineGroups.map((t) => ({
      date: t._id,
      applications: t.count,
    }));

    const stats = {
      jobId: job._id,
      title: job.title,
      company: job.company?.name,
      views: totalViews,
      totalApplications,
      conversionRate,
      statusBreakdown,
      applicationsTimeline,
    };

    return res.status(200).json({
      success: true,
      message: "Job statistics retrieved successfully",
      data: { stats },
      stats,
    });
  } catch (error) {
    next(error);
  }
};
