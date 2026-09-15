import express from "express";
import authenticateToken from "../middleware/isAuthenticated.js";
import requireRole from "../middleware/requireRole.js";
import { requireCompanyOwnership } from "../middleware/requireOwnership.js";
import {
  getAllCompanies,
  getCompanyById,
  registerCompany,
  updateCompany,
} from "../controllers/company.controller.js";
import { logoUpload } from "../middleware/multer.js";

const router = express.Router();

router
  .route("/register")
  .post(authenticateToken, requireRole("Recruiter"), registerCompany);

router
  .route("/get")
  .get(authenticateToken, requireRole("Recruiter"), getAllCompanies);

router
  .route("/get/:id")
  .get(authenticateToken, requireCompanyOwnership, getCompanyById);

router
  .route("/update/:id")
  .put(
    authenticateToken,
    requireRole("Recruiter"),
    requireCompanyOwnership,
    logoUpload,
    updateCompany
  );

export default router;
