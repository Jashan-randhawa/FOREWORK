import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { ATSAnalysis } from "../models/atsAnalysis.model.js";
import AppError from "../utils/AppError.js";

import { ResumeParser } from "../ats/parser/resumeParser.js";
import { JobDescriptionParser } from "../ats/parser/jdParser.js";
import { ATSScoreEngine } from "../ats/scoring/atsScoreEngine.js";
import { RecommendationEngine } from "../ats/recommendations/recommendationEngine.js";
import { ExplanationEngine } from "../ats/explanations/explanationEngine.js";

export const analyzeResume = async (req, res, next) => {
  try {
    const userId = req.id;
    const file = req.file;
    const {
      resume_id,
      resume_url,
      resume_text,
      use_profile_resume,
      job_id,
      jobId,
      job_description,
      application_id,
    } = req.body;

    const targetJobId = job_id || jobId;

    let resumeBuffer = null;
    let resumeUrl = resume_url || "";
    let resumeFilename = file ? file.originalname : "";
    let resumeMimeType = file ? file.mimetype : "";
    let rawText = resume_text || "";

    const isProfileMode =
      use_profile_resume === true ||
      use_profile_resume === "true" ||
      use_profile_resume === 1 ||
      use_profile_resume === "1";

    // 1. Resolve Resume Source
    if (file && file.buffer) {
      resumeBuffer = file.buffer;
    } else if (isProfileMode) {
      const user = await User.findById(userId);
      if (!user || !user.profile?.resume) {
        return res.status(400).json({
          success: false,
          message: "No uploaded resume found in your profile. Please upload a PDF or DOCX file to analyze.",
        });
      }
      resumeUrl = user.profile.resume;
      resumeFilename = user.profile.resumeOriginalname || user.profile.resumeOriginalName || "profile_resume.pdf";
    } else if (resume_id && mongoose.Types.ObjectId.isValid(resume_id)) {
      // Check if resume_id is a User ID or an Application ID
      const candidate = await User.findById(resume_id);
      if (candidate && candidate.profile?.resume) {
        resumeUrl = candidate.profile.resume;
        resumeFilename = candidate.profile.resumeOriginalname || candidate.profile.resumeOriginalName || "resume.pdf";
      } else {
        const app = await Application.findById(resume_id).populate("applicant");
        if (app && app.applicant?.profile?.resume) {
          resumeUrl = app.applicant.profile.resume;
          resumeFilename = app.applicant.profile.resumeOriginalname || app.applicant.profile.resumeOriginalName || "resume.pdf";
        }
      }
    } else if (!resumeUrl && !rawText) {
      // Convenient fallback: if user has a profile resume, use it
      const user = await User.findById(userId);
      if (user && user.profile?.resume) {
        resumeUrl = user.profile.resume;
        resumeFilename = user.profile.resumeOriginalname || user.profile.resumeOriginalName || "profile_resume.pdf";
      }
    }

    if (!resumeBuffer && !resumeUrl && !rawText) {
      return res.status(400).json({
        success: false,
        message: "Please provide a resume file (PDF or DOCX), paste resume text, or select your profile resume for analysis.",
      });
    }

    // 2. Parse Resume into Normalized JSON
    const normalizedResume = await ResumeParser.parse({
      buffer: resumeBuffer,
      url: resumeUrl,
      rawText,
      filename: resumeFilename,
      mimeType: resumeMimeType,
    });

    // 3. Resolve and Parse Job Description (if provided)
    let parsedJd = null;
    let jobDocument = null;

    if (targetJobId && mongoose.Types.ObjectId.isValid(targetJobId)) {
      jobDocument = await Job.findById(targetJobId);
      if (jobDocument) {
        const fullJdText = `${jobDocument.title}\n\n${jobDocument.description}\n\nRequirements:\n${(
          jobDocument.requirements || []
        ).join("\n")}`;
        parsedJd = JobDescriptionParser.parse(fullJdText, jobDocument.title);
      }
    } else if (job_description && job_description.trim().length > 0) {
      parsedJd = JobDescriptionParser.parse(job_description);
    }

    // 4. Compute Scores & Metrics
    const scoringResult = ATSScoreEngine.evaluate({
      normalizedResume,
      parsedJd,
    });

    // 5. Generate Evidence-Based Recommendations
    const recommendations = RecommendationEngine.generate({
      normalizedResume,
      parsedJd,
      scoringResult,
    });

    // 6. Generate Data-Driven Explanation
    const explanationData = await ExplanationEngine.explain({
      normalizedResume,
      parsedJd,
      scoringResult,
    });

    // Extraction and matching confidence
    const extractionConfidence = normalizedResume.metadata?.extraction_confidence || 0.95;
    const matchingConfidence = parsedJd ? 0.9 : 0.95;

    // 7. Persist to MongoDB
    const atsRecord = await ATSAnalysis.create({
      applicant: userId,
      job: jobDocument ? jobDocument._id : null,
      resume_url: resumeUrl || (file ? "Uploaded File" : "Plain Text"),
      overall_score: scoringResult.overall_score,
      ats_compatibility_score: scoringResult.ats_compatibility_score,
      job_match_score: scoringResult.job_match_score,
      breakdown: scoringResult.breakdown,
      skills: {
        matched: scoringResult.skills.matched,
        missing_required: scoringResult.skills.missing_required,
        missing_preferred: scoringResult.skills.missing_preferred,
        all_missing: scoringResult.skills.all_missing,
      },
      confidence: {
        extraction: extractionConfidence,
        matching: matchingConfidence,
      },
      formatting_issues: normalizedResume.metadata?.formatting_risks || [],
      recommendations,
      explanation: explanationData.overall,
      analysis_json: {
        breakdown_reasons: explanationData.breakdown_reasons,
        normalized_resume: {
          personal: normalizedResume.personal,
          summary: normalizedResume.summary,
          experience: normalizedResume.experience,
          education: normalizedResume.education,
          skills: normalizedResume.skills,
          projects: normalizedResume.projects,
          certifications: normalizedResume.certifications,
          languages: normalizedResume.languages,
          sections_detected: normalizedResume.sections_detected,
        },
        job_details: parsedJd
          ? {
              title: parsedJd.job_title,
              required_skills: parsedJd.required_skills,
              preferred_skills: parsedJd.preferred_skills,
            }
          : null,
      },
      algorithm_version: scoringResult.algorithm_version,
    });

    // 8. If linked to an application, update the application record
    if (application_id && mongoose.Types.ObjectId.isValid(application_id)) {
      await Application.findByIdAndUpdate(application_id, {
        atsScore: scoringResult.overall_score,
        atsDetails: {
          ats_compatibility: scoringResult.ats_compatibility_score,
          job_match: scoringResult.job_match_score,
          breakdown: scoringResult.breakdown,
          skills: scoringResult.skills,
        },
        atsAnalysis: atsRecord._id,
      });
    } else if (jobDocument && userId) {
      // If user has an existing application for this job, attach the score
      await Application.findOneAndUpdate(
        { job: jobDocument._id, applicant: userId },
        {
          atsScore: scoringResult.overall_score,
          atsDetails: {
            ats_compatibility: scoringResult.ats_compatibility_score,
            job_match: scoringResult.job_match_score,
            breakdown: scoringResult.breakdown,
            skills: scoringResult.skills,
          },
          atsAnalysis: atsRecord._id,
        }
      );
    }

    return res.status(200).json({
      success: true,
      score: scoringResult.overall_score,
      overall_score: scoringResult.overall_score,
      ats_compatibility_score: scoringResult.ats_compatibility_score,
      job_match_score: scoringResult.job_match_score,
      breakdown: scoringResult.breakdown,
      skills: {
        matched: scoringResult.skills.matched,
        missing: scoringResult.skills.all_missing,
        missing_required: scoringResult.skills.missing_required,
        missing_preferred: scoringResult.skills.missing_preferred,
      },
      confidence: {
        extraction: extractionConfidence,
        matching: matchingConfidence,
      },
      formatting_issues: normalizedResume.metadata?.formatting_risks || [],
      recommendations,
      explanation: explanationData.overall,
      breakdown_explanations: explanationData.breakdown_reasons,
      normalized_resume: {
        personal: normalizedResume.personal,
        summary: normalizedResume.summary,
        experience: normalizedResume.experience,
        education: normalizedResume.education,
        skills: normalizedResume.skills,
        sections_detected: normalizedResume.sections_detected,
        page_count: normalizedResume.metadata?.page_count,
        word_count: normalizedResume.metadata?.word_count,
      },
      analysis_id: atsRecord._id,
      algorithm_version: scoringResult.algorithm_version,
      created_at: atsRecord.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lightweight compatibility scoring endpoint (POST /api/ats/score)
 */
export const scoreResume = async (req, res, next) => {
  try {
    const file = req.file;
    const { jobId, resumeUrl, resume_text } = req.body;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ success: false, message: "Valid jobId is required" });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    let buffer = file ? file.buffer : null;
    let url = resumeUrl || "";

    const normalizedResume = await ResumeParser.parse({
      buffer,
      url,
      rawText: resume_text,
      filename: file ? file.originalname : "resume.pdf",
    });

    const fullJdText = `${job.title}\n\n${job.description}\n\n${(job.requirements || []).join("\n")}`;
    const parsedJd = JobDescriptionParser.parse(fullJdText, job.title);

    const scoringResult = ATSScoreEngine.evaluate({ normalizedResume, parsedJd });

    return res.status(200).json({
      success: true,
      score: scoringResult.overall_score / 100, // normalized 0.0 to 1.0 for score endpoint
      scorePercentage: scoringResult.overall_score,
      details: {
        skillsMatch: (scoringResult.breakdown.job_match / 30).toFixed(2),
        experienceMatch: (scoringResult.breakdown.experience / 20).toFixed(2),
        educationMatch: (scoringResult.breakdown.qualifications / 10).toFixed(2),
        parsingScore: (scoringResult.breakdown.parsing / 20).toFixed(2),
      },
      matchedSkills: scoringResult.skills.matched,
      missingSkills: scoringResult.skills.all_missing,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve previous ATS analysis by ID
 */
export const getAnalysisById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid analysis ID" });
    }

    const analysis = await ATSAnalysis.findById(id).populate("job", "title company location");
    if (!analysis) {
      return res.status(404).json({ success: false, message: "ATS analysis not found" });
    }

    return res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's ATS analysis history
 */
export const getUserHistory = async (req, res, next) => {
  try {
    const userId = req.id;
    const history = await ATSAnalysis.find({ applicant: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("job", "title location");

    return res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Recruiter endpoint: Get or calculate ATS score for a specific application
 */
export const getApplicationATSScore = async (req, res, next) => {
  try {
    const { appId } = req.params;
    if (!appId || !mongoose.Types.ObjectId.isValid(appId)) {
      return res.status(400).json({ success: false, message: "Invalid application ID" });
    }

    const app = await Application.findById(appId)
      .populate("applicant")
      .populate("job")
      .populate("atsAnalysis");

    if (!app) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    // If pre-computed analysis exists, return it
    if (app.atsAnalysis) {
      return res.status(200).json({
        success: true,
        analysis: app.atsAnalysis,
        score: app.atsScore,
        details: app.atsDetails,
      });
    }

    // If candidate has resume and job exists, compute on the fly!
    if (app.applicant?.profile?.resume && app.job) {
      const normalizedResume = await ResumeParser.parse({
        url: app.applicant.profile.resume,
        filename: app.applicant.profile.resumeOriginalname || "resume.pdf",
      });

      const fullJdText = `${app.job.title}\n\n${app.job.description}\n\n${(app.job.requirements || []).join("\n")}`;
      const parsedJd = JobDescriptionParser.parse(fullJdText, app.job.title);

      const scoringResult = ATSScoreEngine.evaluate({ normalizedResume, parsedJd });
      const recommendations = RecommendationEngine.generate({ normalizedResume, parsedJd, scoringResult });
      const explanationData = await ExplanationEngine.explain({ normalizedResume, parsedJd, scoringResult });

      const atsRecord = await ATSAnalysis.create({
        applicant: app.applicant._id,
        job: app.job._id,
        resume_url: app.applicant.profile.resume,
        overall_score: scoringResult.overall_score,
        ats_compatibility_score: scoringResult.ats_compatibility_score,
        job_match_score: scoringResult.job_match_score,
        breakdown: scoringResult.breakdown,
        skills: scoringResult.skills,
        confidence: {
          extraction: normalizedResume.metadata?.extraction_confidence || 0.95,
          matching: 0.9,
        },
        formatting_issues: normalizedResume.metadata?.formatting_risks || [],
        recommendations,
        explanation: explanationData.overall,
        analysis_json: {
          breakdown_reasons: explanationData.breakdown_reasons,
          normalized_resume: {
            personal: normalizedResume.personal,
            experience: normalizedResume.experience,
            education: normalizedResume.education,
            skills: normalizedResume.skills,
          },
        },
        algorithm_version: scoringResult.algorithm_version,
      });

      app.atsScore = scoringResult.overall_score;
      app.atsDetails = {
        ats_compatibility: scoringResult.ats_compatibility_score,
        job_match: scoringResult.job_match_score,
        breakdown: scoringResult.breakdown,
        skills: scoringResult.skills,
      };
      app.atsAnalysis = atsRecord._id;
      await app.save();

      return res.status(200).json({
        success: true,
        analysis: atsRecord,
        score: app.atsScore,
        details: app.atsDetails,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Applicant does not have a readable resume uploaded",
    });
  } catch (error) {
    next(error);
  }
};
