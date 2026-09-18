import mongoose from "mongoose";

const atsAnalysisSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      default: null,
      index: true,
    },
    resume_url: {
      type: String,
      default: "",
    },
    overall_score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      index: true,
    },
    ats_compatibility_score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    job_match_score: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    breakdown: {
      parsing: { type: Number, default: 0 },
      job_match: { type: Number, default: 0 },
      experience: { type: Number, default: 0 },
      sections: { type: Number, default: 0 },
      qualifications: { type: Number, default: 0 },
      quality: { type: Number, default: 0 },
    },
    skills: {
      matched: [{ type: String }],
      missing_required: [{ type: String }],
      missing_preferred: [{ type: String }],
      all_missing: [{ type: String }],
    },
    confidence: {
      extraction: { type: Number, default: 0.95 },
      matching: { type: Number, default: 0.9 },
    },
    formatting_issues: [
      {
        code: String,
        severity: String,
        message: String,
        recommendation: String,
      },
    ],
    recommendations: [
      {
        priority: String,
        category: String,
        title: String,
        description: String,
        actionable_tip: String,
      },
    ],
    explanation: {
      type: String,
      default: "",
    },
    analysis_json: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    algorithm_version: {
      type: String,
      default: "ats_v1.0",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

atsAnalysisSchema.index({ applicant: 1, createdAt: -1 });
atsAnalysisSchema.index({ job: 1, overall_score: -1 });

export const ATSAnalysis = mongoose.model("ATSAnalysis", atsAnalysisSchema);
export default ATSAnalysis;
