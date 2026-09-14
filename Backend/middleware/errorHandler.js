import config from "../config/index.js";

const errorHandler = (err, req, res, next) => {
  let { statusCode = 500, message = "Internal Server Error", details = null } = err;

  // Handle Mongoose Validation Error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate value entered for ${field}. Please use another value.`;
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid format for resource identifier: ${err.value}`;
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please authenticate again.";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired. Please log in again.";
  }

  const response = {
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(!config.isProduction && { stack: err.stack }),
  };

  if (statusCode >= 500) {
    console.error(`[Error 500] ${err.message}`, err.stack);
  }

  return res.status(statusCode).json(response);
};

export default errorHandler;
