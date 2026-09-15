import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { Application } from "../models/application.model.js";
import { AuditLog } from "../models/auditLog.model.js";

// Helper to record audit log entries (ADMIN-003)
const logAuditEvent = async ({ actor, action, targetType, targetId, details = {} }) => {
  try {
    await AuditLog.create({
      actor,
      action,
      targetType,
      targetId,
      details,
    });
  } catch (err) {
    console.error("Failed to write audit log:", err.message);
  }
};

// 1. Get Platform Users with search, role filter, pagination (ADMIN-002)
export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (role) {
      query.role = role;
    }
    if (search && search.trim()) {
      const cleanSearch = search.trim();
      query.$or = [
        { fullname: { $regex: cleanSearch, $options: "i" } },
        { email: { $regex: cleanSearch, $options: "i" } },
        { phoneNumber: { $regex: cleanSearch, $options: "i" } },
      ];
    }

    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum) || 1;

    const users = await User.find(query)
      .select("-password -pancard -adharcard -pancardHash -adharcardHash")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: {
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasMore: pageNum < totalPages,
        },
      },
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalUsers: total,
        totalPages,
        hasMore: pageNum < totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Suspend or activate a user (ADMIN-002)
export const toggleUserStatus = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { isSuspended, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    if (userId.toString() === req.id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Administrators cannot suspend their own accounts",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const targetSuspended = isSuspended !== undefined ? Boolean(isSuspended) : !user.isSuspended;
    user.isSuspended = targetSuspended;
    await user.save();

    await logAuditEvent({
      actor: req.id,
      action: targetSuspended ? "USER_SUSPENDED" : "USER_UNSUSPENDED",
      targetType: "User",
      targetId: user._id,
      details: { email: user.email, role: user.role, isSuspended: targetSuspended, reason },
    });

    return res.status(200).json({
      success: true,
      message: `User account ${targetSuspended ? "suspended" : "activated"} successfully`,
      data: { user },
      user,
    });
  } catch (error) {
    next(error);
  }
};

// 3. Get all platform jobs (ADMIN-002)
export const getJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (status) {
      query.status = status.toLowerCase();
    }
    if (search && search.trim()) {
      const cleanSearch = search.trim();
      query.$or = [
        { title: { $regex: cleanSearch, $options: "i" } },
        { description: { $regex: cleanSearch, $options: "i" } },
      ];
    }

    const total = await Job.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum) || 1;

    const jobs = await Job.find(query)
      .populate("company", "name logo location isVerified")
      .populate("created_by", "fullname email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      message: "Platform jobs retrieved successfully",
      data: {
        jobs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasMore: pageNum < totalPages,
        },
      },
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

// 4. Moderate a job's status (ADMIN-002)
export const moderateJob = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const { status, reason } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required for moderation",
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

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
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

    const oldStatus = job.status;
    job.status = normalizedStatus;
    await job.save();

    await logAuditEvent({
      actor: req.id,
      action: "JOB_STATUS_CHANGED",
      targetType: "Job",
      targetId: job._id,
      details: { title: job.title, oldStatus, newStatus: normalizedStatus, reason },
    });

    return res.status(200).json({
      success: true,
      message: `Job moderated to ${normalizedStatus}`,
      data: { job },
      job,
    });
  } catch (error) {
    next(error);
  }
};

// 5. Remove a job (ADMIN-002)
export const removeJob = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
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

    await Application.deleteMany({ job: jobId });
    await Job.findByIdAndDelete(jobId);

    await logAuditEvent({
      actor: req.id,
      action: "JOB_REMOVED",
      targetType: "Job",
      targetId: jobId,
      details: { title: job.title, reason },
    });

    return res.status(200).json({
      success: true,
      message: "Job and its applications removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// 6. Get platform companies (ADMIN-002)
export const getCompanies = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, isVerified, search } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (isVerified !== undefined && isVerified !== "") {
      query.isVerified = isVerified === "true" || isVerified === true;
    }
    if (search && search.trim()) {
      const cleanSearch = search.trim();
      query.$or = [
        { name: { $regex: cleanSearch, $options: "i" } },
        { location: { $regex: cleanSearch, $options: "i" } },
      ];
    }

    const total = await Company.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum) || 1;

    const companies = await Company.find(query)
      .populate("userId", "fullname email phoneNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      message: "Companies retrieved successfully",
      data: {
        companies,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasMore: pageNum < totalPages,
        },
      },
      companies,
    });
  } catch (error) {
    next(error);
  }
};

// 7. Verify / Unverify a company (ADMIN-002)
export const verifyCompany = async (req, res, next) => {
  try {
    const companyId = req.params.id;
    const { isVerified, reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid company ID format",
      });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const targetVerified = isVerified !== undefined ? Boolean(isVerified) : !company.isVerified;
    company.isVerified = targetVerified;
    await company.save();

    await logAuditEvent({
      actor: req.id,
      action: targetVerified ? "COMPANY_VERIFIED" : "COMPANY_UNVERIFIED",
      targetType: "Company",
      targetId: company._id,
      details: { name: company.name, isVerified: targetVerified, reason },
    });

    return res.status(200).json({
      success: true,
      message: `Company ${targetVerified ? "verified" : "unverified"} successfully`,
      data: { company },
      company,
    });
  } catch (error) {
    next(error);
  }
};

// 8. Retrieve audit logs (ADMIN-003)
export const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, action, targetType } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (action) query.action = action;
    if (targetType) query.targetType = targetType;

    const total = await AuditLog.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum) || 1;

    const logs = await AuditLog.find(query)
      .populate("actor", "fullname email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      message: "Audit logs retrieved successfully",
      data: {
        logs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasMore: pageNum < totalPages,
        },
      },
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalLogs: total,
        totalPages,
        hasMore: pageNum < totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 9. Overview Platform Statistics
export const getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalRecruiters,
      totalJobs,
      totalCompanies,
      totalApplications,
      recentAuditLogs,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "Student" }),
      User.countDocuments({ role: "Recruiter" }),
      Job.countDocuments(),
      Company.countDocuments(),
      Application.countDocuments(),
      AuditLog.find().sort({ createdAt: -1 }).limit(5).populate("actor", "fullname email"),
    ]);

    const statsPayload = {
      totalUsers,
      totalStudents,
      totalRecruiters,
      totalJobs,
      totalCompanies,
      totalApplications,
      usersCount: totalUsers,
      jobsCount: totalJobs,
      companiesCount: totalCompanies,
    };

    return res.status(200).json({
      success: true,
      data: {
        stats: statsPayload,
        recentAuditLogs,
      },
      stats: statsPayload,
      recentAuditLogs,
    });
  } catch (error) {
    next(error);
  }
};
