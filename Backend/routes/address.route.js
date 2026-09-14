import express from "express";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/address.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import validate from "../middleware/validate.js";
import {
  createAddressSchema,
  updateAddressSchema,
} from "../validators/address.validator.js";

const router = express.Router();

router.get("/", isAuthenticated, getAddresses);
router.post("/", isAuthenticated, validate(createAddressSchema), createAddress);
router.put("/:id", isAuthenticated, validate(updateAddressSchema), updateAddress);
router.delete("/:id", isAuthenticated, deleteAddress);
router.put("/:id/default", isAuthenticated, setDefaultAddress);

export default router;
