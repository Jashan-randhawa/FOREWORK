import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import validate from "../middleware/validate.js";
import {
  getAdminStats,
  getAdminUsers,
  updateUserRole,
} from "../controllers/admin.controller.js";
import {
  updateUserRoleSchema,
  adminUserQuerySchema,
} from "../validators/admin.validator.js";

const router = express.Router();

// All admin routes require Authentication + Admin role
router.use(isAuthenticated, authorizeRoles("Admin"));

router.get("/stats", getAdminStats);
router.get("/users", validate(adminUserQuerySchema, "query"), getAdminUsers);
router.put("/users/:id/role", validate(updateUserRoleSchema, "body"), updateUserRole);

export default router;
