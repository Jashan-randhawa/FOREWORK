import Joi from "joi";

export const createAddressSchema = Joi.object({
  label: Joi.string().valid("home", "work", "other").default("home"),
  line1: Joi.string().trim().required().messages({
    "any.required": "Address line 1 is required",
    "string.empty": "Address line 1 cannot be empty",
  }),
  line2: Joi.string().trim().allow("").optional(),
  city: Joi.string().trim().required().messages({
    "any.required": "City is required",
  }),
  state: Joi.string().trim().required().messages({
    "any.required": "State is required",
  }),
  postalCode: Joi.string().trim().required().messages({
    "any.required": "Postal code is required",
  }),
  country: Joi.string().trim().required().messages({
    "any.required": "Country is required",
  }),
  phone: Joi.string().trim().required().messages({
    "any.required": "Phone number is required",
  }),
  isDefault: Joi.boolean().default(false),
});

export const updateAddressSchema = Joi.object({
  label: Joi.string().valid("home", "work", "other").optional(),
  line1: Joi.string().trim().optional(),
  line2: Joi.string().trim().allow("").optional(),
  city: Joi.string().trim().optional(),
  state: Joi.string().trim().optional(),
  postalCode: Joi.string().trim().optional(),
  country: Joi.string().trim().optional(),
  phone: Joi.string().trim().optional(),
  isDefault: Joi.boolean().optional(),
}).min(1);
