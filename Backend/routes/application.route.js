import express from "express";
import authenticateToken from "../middleware/isAuthenticated.js";
import requireRole from "../middleware/requireRole.js";
import {
  requireJobOwnership,
  requireApplicationOwnership,
} from "../middleware/requireOwnership.js";
import {
  applyJob,
  getApplicants,
  getAppliedJobs,
  updateStatus,
  addRecruiterNote,
  scheduleInterview,
} from "../controllers/application.controller.js";

const router = express.Router();

// Application mutation is now POST and restricted to Students
router
  .route("/apply/:id")
  .post(authenticateToken, requireRole("Student"), applyJob);

router
  .route("/get")
  .get(authenticateToken, requireRole("Student"), getAppliedJobs);

router
  .route("/:id/applicants")
  .get(
    authenticateToken,
    requireRole("Recruiter"),
    requireJobOwnership,
    getApplicants
  );

router
  .route("/status/:id/update")
  .post(
    authenticateToken,
    requireRole("Recruiter"),
    requireApplicationOwnership,
    updateStatus
  );

// Recruiter notes on an application (EMP-003)
router
  .route("/:id/notes")
  .post(
    authenticateToken,
    requireRole("Recruiter"),
    requireApplicationOwnership,
    addRecruiterNote
  );

// Interview scheduling (EMP-004)
router
  .route("/:id/schedule")
  .post(
    authenticateToken,
    requireRole("Recruiter"),
    requireApplicationOwnership,
    scheduleInterview
  );

export default router;
