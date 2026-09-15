import mongoose from "mongoose";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import {
  sendInterviewInvitationEmail,
  sendApplicationSubmittedEmail,
  sendNewApplicantNotificationEmail,
  sendApplicationStatusEmail,
} from "../utils/mailer.js";
import { createNotification } from "../utils/createNotification.js";

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

    // NOTIFY-002 & NOTIFY-003: Trigger email and in-app notifications
    try {
      const candidate = await User.findById(userId);
      const populatedJob = await Job.findById(jobId).populate("company created_by");

      if (candidate && populatedJob) {
        const candidateName = candidate.fullname || "Candidate";
        const jobTitle = populatedJob.title;
        const companyName = populatedJob.company?.name || "Company";
        const recruiter = populatedJob.created_by;

        // 1. Email to candidate
        if (candidate.email) {
          sendApplicationSubmittedEmail({
            email: candidate.email,
            candidateName,
            jobTitle,
            companyName,
          }).catch((err) => console.error("Error sending applicant email:", err.message));
        }

        // 2. Email to recruiter
        if (recruiter?.email) {
          sendNewApplicantNotificationEmail({
            email: recruiter.email,
            recruiterName: recruiter.fullname || "Recruiter",
            candidateName,
            jobTitle,
          }).catch((err) => console.error("Error sending recruiter email:", err.message));
        }

        // 3. In-app notification for candidate
        await createNotification({
          recipient: userId,
          type: "APPLICATION_SUBMITTED",
          title: "Application Submitted",
          message: `You successfully applied for "${jobTitle}" at ${companyName}.`,
          link: "/profile",
          metadata: { jobId: populatedJob._id, applicationId: newApplication._id },
        });

        // 4. In-app notification for recruiter
        if (recruiter?._id) {
          await createNotification({
            recipient: recruiter._id,
            sender: userId,
            type: "NEW_APPLICANT",
            title: "New Application Received",
            message: `${candidateName} applied for "${jobTitle}".`,
            link: `/recruiter/jobs/${populatedJob._id}/applicants`,
            metadata: { jobId: populatedJob._id, applicationId: newApplication._id, candidateId: userId },
          });
        }
      }
    } catch (notifErr) {
      console.error("Failed to process post-apply notifications:", notifErr.message);
    }

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

    // NOTIFY-002 & NOTIFY-003: Send status change email and in-app notification to candidate
    try {
      const fullApp = await Application.findById(applicationId)
        .populate({
          path: "job",
          populate: { path: "company" },
        })
        .populate("applicant");

      if (fullApp?.applicant) {
        const candidateEmail = fullApp.applicant.email;
        const candidateName = fullApp.applicant.fullname || "Candidate";
        const jobTitle = fullApp.job?.title || "Job Application";
        const companyName = fullApp.job?.company?.name || "";

        // Email to candidate
        if (candidateEmail) {
          sendApplicationStatusEmail({
            email: candidateEmail,
            candidateName,
            jobTitle,
            companyName,
            status: application.status,
          }).catch((err) => console.error("Error sending status email:", err.message));
        }

        // In-app notification for candidate
        await createNotification({
          recipient: fullApp.applicant._id,
          sender: req.id,
          type: "APPLICATION_STATUS",
          title: `Application ${application.status.charAt(0).toUpperCase() + application.status.slice(1)}`,
          message: `Your application for "${jobTitle}" at ${companyName || "the company"} has been marked as ${application.status}.`,
          link: "/profile",
          metadata: { applicationId: fullApp._id, status: application.status },
        });
      }
    } catch (notifErr) {
      console.error("Failed to process status update notifications:", notifErr.message);
    }

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

    // In-app notification for candidate
    if (application.applicant?._id) {
      await createNotification({
        recipient: application.applicant._id,
        sender: req.id,
        type: "INTERVIEW_SCHEDULED",
        title: "Interview Scheduled",
        message: `An interview has been scheduled for "${application.job.title}" on ${parsedDate.toLocaleString()}.`,
        link: "/profile",
        metadata: {
          applicationId: application._id,
          scheduledAt: parsedDate,
          meetingLink: meetingLink.trim(),
        },
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
