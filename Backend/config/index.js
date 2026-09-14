import dotenv from "dotenv";
import { envSchema } from "./env.schema.js";

dotenv.config();

const { error, value: validatedEnv } = envSchema.validate(process.env, {
  abortEarly: false,
  stripUnknown: false,
});

if (error) {
  const missingOrInvalid = error.details.map((detail) => detail.message).join(", ");
  console.error(`[Config Error] Environment validation failed: ${missingOrInvalid}`);
  if (process.env.NODE_ENV !== "test") {
    process.exit(1);
  } else {
    throw new Error(`Environment validation failed: ${missingOrInvalid}`);
  }
}

const config = Object.freeze({
  env: validatedEnv.NODE_ENV,
  isProduction: validatedEnv.NODE_ENV === "production",
  isTest: validatedEnv.NODE_ENV === "test",
  port: validatedEnv.PORT,
  mongoUri: validatedEnv.MONGO_URI,
  jwtSecret: validatedEnv.JWT_SECRET,
  frontendUrl: validatedEnv.FRONTEND_URL,
  cloudinary: {
    cloudName: validatedEnv.CLOUD_NAME,
    apiKey: validatedEnv.CLOUD_API,
    apiSecret: validatedEnv.API_SECRET,
  },
  stripe: {
    secretKey: validatedEnv.STRIPE_SECRET_KEY,
    webhookSecret: validatedEnv.STRIPE_WEBHOOK_SECRET,
  },
  email: {
    smtpHost: validatedEnv.SMTP_HOST,
    smtpPort: validatedEnv.SMTP_PORT,
    smtpUser: validatedEnv.SMTP_USER,
    smtpPass: validatedEnv.SMTP_PASS,
    from: validatedEnv.EMAIL_FROM,
  },
});

export default config;
