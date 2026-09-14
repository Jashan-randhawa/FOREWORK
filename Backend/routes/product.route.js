import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import validate from "../middleware/validate.js";
import { multiImageUpload } from "../middleware/multer.js";
import {
  createProductSchema,
  updateProductSchema,
  queryProductSchema,
} from "../validators/product.validator.js";

const router = express.Router();

router.get("/", validate(queryProductSchema, "query"), getProducts);
router.get("/:id", getProductById);

router.post(
  "/",
  isAuthenticated,
  authorizeRoles("Admin"),
  multiImageUpload,
  validate(createProductSchema),
  createProduct
);

router.put(
  "/:id",
  isAuthenticated,
  authorizeRoles("Admin"),
  validate(updateProductSchema),
  updateProduct
);

router.delete(
  "/:id",
  isAuthenticated,
  authorizeRoles("Admin"),
  deleteProduct
);

export default router;
