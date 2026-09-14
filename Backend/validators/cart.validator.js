import Joi from "joi";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const addCartItemSchema = Joi.object({
  productId: Joi.string().pattern(objectIdPattern).required().messages({
    "any.required": "Product ID is required",
    "string.pattern.base": "Invalid product ID format",
  }),
  quantity: Joi.number().integer().min(1).default(1),
});

export const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(0).required().messages({
    "any.required": "Quantity is required",
    "number.min": "Quantity cannot be negative",
  }),
});
