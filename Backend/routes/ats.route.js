import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { atsUpload } from "../middleware/multer.js";
import {
  analyzeResume,
  scoreResume,
  getAnalysisById,
  getUserHistory,
  getApplicationATSScore,
} from "../controllers/ats.controller.js";

const router = express.Router();

// Primary ATS analysis endpoint (supports multipart file, resume URL, resume ID, profile resume)
router.post("/analyze", isAuthenticated, atsUpload, analyzeResume);

// Compatibility scoring endpoint
router.post("/score", isAuthenticated, atsUpload, scoreResume);

// User's historical analyses
router.get("/history", isAuthenticated, getUserHistory);

// Specific analysis by ID
router.get("/analysis/:id", isAuthenticated, getAnalysisById);

// Recruiter/Candidate application ATS analysis
router.get("/application/:appId", isAuthenticated, getApplicationATSScore);

export default router;
