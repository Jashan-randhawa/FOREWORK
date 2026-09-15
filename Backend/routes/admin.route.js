import express from "express";
import authenticateToken from "../middleware/isAuthenticated.js";
import requireRole from "../middleware/requireRole.js";
import {
  getUsers,
  toggleUserStatus,
  getJobs,
  moderateJob,
  removeJob,
  getCompanies,
  verifyCompany,
  getAuditLogs,
  getStats,
} from "../controllers/admin.controller.js";

const router = express.Router();

// All Admin routes require authentication + Admin role
router.use(authenticateToken, requireRole("Admin"));

router.route("/stats").get(getStats);

router.route("/users").get(getUsers);
router.route("/users/:id/status").put(toggleUserStatus).post(toggleUserStatus).patch(toggleUserStatus);

router.route("/jobs").get(getJobs);
router.route("/jobs/:id/moderate").put(moderateJob).post(moderateJob).patch(moderateJob);
router.route("/jobs/:id/status").put(moderateJob).post(moderateJob).patch(moderateJob);
router.route("/jobs/:id").delete(removeJob);

router.route("/companies").get(getCompanies);
router.route("/companies/:id/verify").put(verifyCompany).post(verifyCompany).patch(verifyCompany);

router.route("/audit-logs").get(getAuditLogs);

export default router;
