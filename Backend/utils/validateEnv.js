export const validateEnv = () => {
  const requiredEnvVars = [
    "MONGO_URI",
    "JWT_SECRET",
  ];

  const missing = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    const errorMsg = `[Startup Error] Missing required environment variables: ${missing.join(
      ", "
    )}`;
    console.error(errorMsg);
    if (process.env.NODE_ENV !== "test") {
      process.exit(1);
    }
  }

  // Ensure FIELD_ENCRYPTION_KEY is available or set default in development/test
  if (!process.env.FIELD_ENCRYPTION_KEY) {
    if (process.env.NODE_ENV === "production") {
      console.error("[Startup Error] Missing required FIELD_ENCRYPTION_KEY in production");
      process.exit(1);
    } else {
      // Default 32-byte key for local dev / testing if not provided
      process.env.FIELD_ENCRYPTION_KEY =
        process.env.FIELD_ENCRYPTION_KEY ||
        "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    }
  }
};

export default validateEnv;
