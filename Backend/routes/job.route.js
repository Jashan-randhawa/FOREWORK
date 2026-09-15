import express from "express";
import authenticateToken from "../middleware/isAuthenticated.js";
import requireRole from "../middleware/requireRole.js";
import {
  getAdminJobs,
  getAllJobs,
  getJobById,
  postJob,
} from "../controllers/job.controller.js";
import {
  saveJob,
  unsaveJob,
  getSavedJobs,
} from "../controllers/savedJob.controller.js";
import {
  createAlert,
  getAlerts,
  deleteAlert,
} from "../controllers/jobAlert.controller.js";

const router = express.Router();

// Recruiter endpoints
router
  .route("/post")
  .post(authenticateToken, requireRole("Recruiter"), postJob);

router
  .route("/getadminjobs")
  .get(authenticateToken, requireRole("Recruiter"), getAdminJobs);

// Candidate Saved Jobs endpoints (CAND-001)
router
  .route("/saved")
  .get(authenticateToken, requireRole("Student"), getSavedJobs);

router
  .route("/:id/save")
  .post(authenticateToken, requireRole("Student"), saveJob);

router
  .route("/:id/unsave")
  .post(authenticateToken, requireRole("Student"), unsaveJob)
  .delete(authenticateToken, requireRole("Student"), unsaveJob);

// Candidate Job Alerts & Saved Searches endpoints (CAND-002)
router
  .route("/alerts")
  .post(authenticateToken, requireRole("Student"), createAlert)
  .get(authenticateToken, requireRole("Student"), getAlerts);

router
  .route("/alerts/:id")
  .delete(authenticateToken, requireRole("Student"), deleteAlert);

// Public Job endpoints
router.route("/get").get(getAllJobs);
router.route("/get/:id").get(getJobById);

export default router;
