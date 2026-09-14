import Joi from "joi";

export const updateUserRoleSchema = Joi.object({
  role: Joi.string().valid("Customer", "Admin").required().messages({
    "any.only": "Role must be either 'Customer' or 'Admin'",
    "any.required": "Role is required",
  }),
});

export const adminUserQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  role: Joi.string().valid("Customer", "Admin"),
  search: Joi.string().trim().max(100),
});
