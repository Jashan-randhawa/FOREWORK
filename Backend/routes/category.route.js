import express from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import validate from "../middleware/validate.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validators/category.validator.js";

const router = express.Router();

router.get("/", getCategories);
router.get("/:id", getCategoryById);

router.post(
  "/",
  isAuthenticated,
  authorizeRoles("Admin"),
  validate(createCategorySchema),
  createCategory
);

router.put(
  "/:id",
  isAuthenticated,
  authorizeRoles("Admin"),
  validate(updateCategorySchema),
  updateCategory
);

router.delete(
  "/:id",
  isAuthenticated,
  authorizeRoles("Admin"),
  deleteCategory
);

export default router;
