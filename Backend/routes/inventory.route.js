import express from "express";
import {
  getInventoryByProductId,
  updateInventoryByProductId,
} from "../controllers/inventory.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const router = express.Router();

router.get("/:productId", isAuthenticated, authorizeRoles("Admin"), getInventoryByProductId);
router.put("/:productId", isAuthenticated, authorizeRoles("Admin"), updateInventoryByProductId);

export default router;
