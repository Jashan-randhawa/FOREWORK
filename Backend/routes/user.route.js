import express from "express";
import {
  login,
  logout,
  register,
  updateProfile,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} from "../controllers/user.controller.js";
import authenticateToken from "../middleware/isAuthenticated.js";
import { photoUpload, resumeUpload } from "../middleware/multer.js";

const router = express.Router();

router.route("/register").post(photoUpload, register);
router.route("/login").post(login);
router.route("/logout").post(logout);
router
  .route("/profile/update")
  .post(authenticateToken, resumeUpload, updateProfile);
router.route("/profile").get(authenticateToken, (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
});

// Candidate Experience: Email verification & Password recovery (AUTH-010, AUTH-011)
router.route("/verify-email/:token?").get(verifyEmail).post(verifyEmail);
router
  .route("/resend-verification")
  .post(authenticateToken, resendVerification);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);

export default router;
