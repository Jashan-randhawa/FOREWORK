import mongoose from "mongoose";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { sendInterviewInvitationEmail } from "../utils/mailer.js";

export const applyJob = async (req, res, next) => {
  try {
    const userId = req.id;
    const jobId = req.params.id;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        message: "Invalid job ID",
        success: false,
      });
    }

    // Check if the user has already applied for this job
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: userId,
    });
    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied for this job",
        success: false,
      });
    }

    // Check if the job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        message: "Job not found",
        success: false,
      });
    }

    // Create a new application
    const newApplication = await Application.create({
      job: jobId,
      applicant: userId,
    });

    job.applications.push(newApplication._id);
    await job.save();

    return res.status(201).json({
      message: "Application submitted successfully",
      application: newApplication,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const getAppliedJobs = async (req, res, next) => {
  try {
    const userId = req.id;
    const applications = await Application.find({ applicant: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "job",
        options: { sort: { createdAt: -1 } },
        populate: { path: "company", options: { sort: { createdAt: -1 } } },
      });

    return res.status(200).json({
      application: applications || [],
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicants = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        message: "Invalid job ID format",
        success: false,
      });
    }

    const job = req.job || (await Job.findById(jobId));
    if (!job) {
      return res.status(404).json({
        message: "Job not found",
        success: false,
      });
    }

    // Enforce ownership: only the recruiter who created this job can view applicants
    if (job.created_by.toString() !== req.id.toString()) {
      return res.status(403).json({
        message: "Forbidden: you do not have permission to view applicants for this job",
        success: false,
      });
    }

    const populatedJob = await Job.findById(jobId).populate({
      path: "applications",
      options: { sort: { createdAt: -1 } },
      populate: [
        { path: "applicant", options: { sort: { createdAt: -1 } } },
        { path: "recruiterNotes.author", select: "fullname email" },
      ],
    });

    return res.status(200).json({
      job: populatedJob,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const applicationId = req.params.id;

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
        success: false,
      });
    }

    const validStatuses = ["pending", "accepted", "rejected"];
    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        message: `Invalid status. Allowed values: ${validStatuses.join(", ")}`,
        success: false,
      });
    }

    if (!applicationId || !mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        message: "Invalid application ID format",
        success: false,
      });
    }

    const application =
      req.application || (await Application.findById(applicationId).populate("job"));

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
        success: false,
      });
    }

    // Enforce ownership: only the recruiter who posted the job can update candidate status
    if (
      !application.job ||
      application.job.created_by.toString() !== req.id.toString()
    ) {
      return res.status(403).json({
        message: "Forbidden: you do not have permission to update this application",
        success: false,
      });
    }

    application.status = status.toLowerCase();
    await application.save();

    return res.status(200).json({
      message: "Application status updated successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

// Add recruiter notes to an application (EMP-003)
export const addRecruiterNote = async (req, res, next) => {
  try {
    const applicationId = req.params.id;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Note text is required",
      });
    }

    if (!applicationId || !mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID format",
      });
    }

    const application = await Application.findById(applicationId).populate("job");
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (
      !application.job ||
      application.job.created_by.toString() !== req.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: you do not have permission to add notes to this application",
      });
    }

    const newNote = {
      author: req.id,
      text: text.trim(),
      createdAt: new Date(),
    };

    application.recruiterNotes.push(newNote);
    await application.save();
    await application.populate("recruiterNotes.author", "fullname email");

    return res.status(201).json({
      success: true,
      message: "Recruiter note added successfully",
      data: { recruiterNotes: application.recruiterNotes },
      recruiterNotes: application.recruiterNotes,
    });
  } catch (error) {
    next(error);
  }
};

// Schedule interview and send email notification (EMP-004)
export const scheduleInterview = async (req, res, next) => {
  try {
    const applicationId = req.params.id;
    const { scheduledAt, meetingLink } = req.body;

    if (!scheduledAt || !meetingLink) {
      return res.status(400).json({
        success: false,
        message: "Scheduled date/time and meeting link are required",
      });
    }

    const parsedDate = new Date(scheduledAt);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format for scheduledAt",
      });
    }

    if (!applicationId || !mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID format",
      });
    }

    const application = await Application.findById(applicationId)
      .populate({
        path: "job",
        populate: { path: "company" },
      })
      .populate("applicant");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (
      !application.job ||
      application.job.created_by.toString() !== req.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: you do not have permission to schedule interviews for this application",
      });
    }

    application.scheduledAt = parsedDate;
    application.meetingLink = meetingLink.trim();
    await application.save();

    // Send email notification to candidate
    if (application.applicant?.email) {
      await sendInterviewInvitationEmail({
        email: application.applicant.email,
        candidateName: application.applicant.fullname || "Candidate",
        jobTitle: application.job.title,
        companyName: application.job.company?.name || "",
        scheduledAt: parsedDate,
        meetingLink: meetingLink.trim(),
      });
    }

    return res.status(200).json({
      success: true,
      message: "Interview scheduled successfully and invitation sent",
      data: { application },
      application,
    });
  } catch (error) {
    next(error);
  }
};
