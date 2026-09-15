import multer from "multer";

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || undefined;

  // Handle Multer errors
  if (err instanceof multer.MulterError) {
    statusCode = 400;
    if (err.code === "LIMIT_FILE_SIZE") {
      statusCode = 413;
      message = "File too large. Maximum allowed size is 5MB.";
    } else {
      message = `Upload error: ${err.message}`;
    }
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ID format for parameter: ${err.path}`;
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const keys = Object.keys(err.keyPattern || err.keyValue || {});
    if (keys.includes("job") && keys.includes("applicant")) {
      message = "You have already applied for this job.";
    } else {
      const field = Object.keys(err.keyValue || {})[0];
      message = field
        ? `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`
        : "Duplicate field value entered.";
    }
  }

  // Handle Mongoose ValidationError
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please log in again.";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired. Please log in again.";
  }

  if (process.env.NODE_ENV !== "test" && statusCode === 500) {
    console.error("Unhandled Error:", err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};

export default errorHandler;
