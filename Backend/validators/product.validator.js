import Joi from "joi";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const createProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).required().messages({
    "any.required": "Product name is required",
    "string.empty": "Product name cannot be empty",
  }),
  description: Joi.string().trim().min(5).required().messages({
    "any.required": "Product description is required",
  }),
  price: Joi.number().integer().min(0).required().messages({
    "any.required": "Product price in minor units is required",
    "number.base": "Price must be an integer (minor currency units)",
    "number.min": "Price cannot be negative",
  }),
  category: Joi.string().pattern(objectIdPattern).required().messages({
    "any.required": "Category ID is required",
    "string.pattern.base": "Invalid Category ID format",
  }),
  brand: Joi.string().trim().allow("").optional(),
  attributes: Joi.object().optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).optional(),
  description: Joi.string().trim().min(5).optional(),
  price: Joi.number().integer().min(0).optional(),
  category: Joi.string().pattern(objectIdPattern).optional(),
  brand: Joi.string().trim().allow("").optional(),
  attributes: Joi.object().optional(),
  isActive: Joi.boolean().optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
}).min(1);

export const queryProductSchema = Joi.object({
  category: Joi.string().pattern(objectIdPattern).optional(),
  search: Joi.string().trim().allow("").optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string()
    .valid("price_asc", "price_desc", "latest", "rating")
    .default("latest"),
});
