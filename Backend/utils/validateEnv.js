// Known dev/placeholder key — also shipped in .env.example for local setup only.
// Must never be used to encrypt real PII in production.
const INSECURE_DEFAULT_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

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
      process.env.FIELD_ENCRYPTION_KEY = INSECURE_DEFAULT_KEY;
    }
  } else if (
    process.env.NODE_ENV === "production" &&
    process.env.FIELD_ENCRYPTION_KEY === INSECURE_DEFAULT_KEY
  ) {
    // Guard against the publicly-known placeholder value (from .env.example)
    // being deployed as-is — this would make PAN/Aadhaar encryption trivially
    // reversible by anyone who has read the public repo.
    console.error(
      "[Startup Error] FIELD_ENCRYPTION_KEY is set to the public placeholder value from .env.example. " +
      "Generate a unique secret for production (e.g. `openssl rand -hex 32`) and set it before starting the server."
    );
    process.exit(1);
  }
};

export default validateEnv;
