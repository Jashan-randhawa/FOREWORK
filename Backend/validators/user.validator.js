import Joi from "joi";

export const registerSchema = Joi.object({
  fullname: Joi.string().trim().min(2).max(100).required().messages({
    "any.required": "Full name is required",
    "string.empty": "Full name cannot be empty",
    "string.min": "Full name must be at least 2 characters",
  }),
  email: Joi.string().trim().email().required().messages({
    "any.required": "Email is required",
    "string.email": "Please provide a valid email address",
  }),
  phoneNumber: Joi.string().trim().min(7).max(20).required().messages({
    "any.required": "Phone number is required",
    "string.empty": "Phone number cannot be empty",
  }),
  password: Joi.string().min(6).max(100).required().messages({
    "any.required": "Password is required",
    "string.min": "Password must be at least 6 characters long",
  }),
  avatarUrl: Joi.string().uri().allow("").optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    "any.required": "Email is required",
    "string.email": "Please provide a valid email address",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

export const updateProfileSchema = Joi.object({
  fullname: Joi.string().trim().min(2).max(100).optional(),
  phoneNumber: Joi.string().trim().min(7).max(20).optional(),
  avatarUrl: Joi.string().uri().allow("").optional(),
}).min(1);
