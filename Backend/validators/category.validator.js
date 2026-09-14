import Joi from "joi";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    "any.required": "Category name is required",
    "string.empty": "Category name cannot be empty",
    "string.min": "Category name must have at least 2 characters",
  }),
  parentCategory: Joi.string()
    .pattern(objectIdPattern)
    .allow(null, "")
    .optional()
    .messages({
      "string.pattern.base": "Invalid parentCategory ID format",
    }),
  imageUrl: Joi.string().uri().allow("").optional(),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  parentCategory: Joi.string()
    .pattern(objectIdPattern)
    .allow(null, "")
    .optional()
    .messages({
      "string.pattern.base": "Invalid parentCategory ID format",
    }),
  imageUrl: Joi.string().uri().allow("").optional(),
}).min(1);
