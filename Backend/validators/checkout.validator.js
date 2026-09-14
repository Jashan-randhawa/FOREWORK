import Joi from "joi";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const checkoutSchema = Joi.object({
  addressId: Joi.string().pattern(objectIdPattern).required().messages({
    "any.required": "A shipping address ID is required",
    "string.pattern.base": "Invalid shipping address ID format",
  }),
  couponCode: Joi.string().trim().uppercase().allow("").optional(),
});
