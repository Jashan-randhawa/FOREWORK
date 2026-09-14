import express from "express";
import { checkout } from "../controllers/checkout.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import validate from "../middleware/validate.js";
import { checkoutSchema } from "../validators/checkout.validator.js";

const router = express.Router();

router.post("/", isAuthenticated, validate(checkoutSchema), checkout);

export default router;
