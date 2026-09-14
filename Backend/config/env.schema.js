import Joi from "joi";

export const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  PORT: Joi.number().port().default(5001),
  MONGO_URI: Joi.string().required().messages({
    "any.required": "MONGO_URI is required in environment configuration",
  }),
  JWT_SECRET: Joi.string().min(8).required().messages({
    "any.required": "JWT_SECRET is required in environment configuration",
    "string.min": "JWT_SECRET must be at least 8 characters long",
  }),
  FRONTEND_URL: Joi.string().uri().default("http://localhost:5173"),
  CLOUD_NAME: Joi.string().allow("").optional(),
  CLOUD_API: Joi.string().allow("").optional(),
  API_SECRET: Joi.string().allow("").optional(),
  STRIPE_SECRET_KEY: Joi.string().allow("").optional(),
  STRIPE_WEBHOOK_SECRET: Joi.string().allow("").optional(),
  SMTP_HOST: Joi.string().allow("").optional(),
  SMTP_PORT: Joi.number().port().optional(),
  SMTP_USER: Joi.string().allow("").optional(),
  SMTP_PASS: Joi.string().allow("").optional(),
  EMAIL_FROM: Joi.string().allow("").optional().default("no-reply@forework.com"),
}).unknown(true);
