/**
 * Centralized Error Classification and Sanitization for FOREWORK
 * Maps HTTP status codes to user-friendly messages and prevents raw
 * MongoDB / backend stack leaks into the UI.
 */

export class ApiError extends Error {
  constructor({ message, status, code, details, raw }) {
    super(message);
    this.name = "ApiError";
    this.status = status || 500;
    this.code = code || "INTERNAL_ERROR";
    this.details = details || null;
    this.raw = raw;
  }
}

/**
 * Returns default user-facing message based on HTTP status code.
 */
export function getDefaultStatusMessage(status) {
  switch (status) {
    case 400:
      return "Invalid request. Please check your submitted details.";
    case 401:
      return "Your session has expired. Please log in again.";
    case 403:
      return "Access denied. You do not have permission to view or perform this action.";
    case 404:
      return "The requested resource could not be found.";
    case 409:
      return "You have already applied for this job or this record already exists.";
    case 422:
      return "Validation failed. Please verify your submitted inputs.";
    case 429:
      return "Too many requests. Please wait a moment before trying again.";
    case 500:
    case 502:
    case 503:
    case 504:
      return "An unexpected server error occurred. Please try again later.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
}

/**
 * Strips raw database internals, stack traces, and sensitive keywords from error messages.
 */
export function sanitizeErrorMessage(message, status) {
  if (!message || typeof message !== "string") {
    return getDefaultStatusMessage(status);
  }

  const lower = message.toLowerCase();

  // Detect MongoDB duplicate key error or unique index violations
  if (
    lower.includes("e11000") ||
    lower.includes("duplicate key") ||
    (lower.includes("index") && lower.includes("dup"))
  ) {
    return "You have already applied for this job or this item already exists.";
  }

  // Detect raw database or technical stack leaks
  if (
    lower.includes("mongo") ||
    lower.includes("mongoose") ||
    lower.includes("cast to objectid") ||
    lower.includes("syntaxerror") ||
    lower.includes("typeerror") ||
    lower.includes("referenceerror") ||
    lower.includes("at ") ||
    lower.includes("node_modules") ||
    lower.includes("eval at") ||
    message.includes("\n")
  ) {
    return getDefaultStatusMessage(status);
  }

  return message;
}

/**
 * Classifies an Axios error or standard error into a normalized ApiError.
 */
export function parseApiError(error) {
  if (!error) {
    return new ApiError({
      message: "An unexpected error occurred.",
      status: 500,
      code: "UNKNOWN_ERROR",
    });
  }

  if (error instanceof ApiError) {
    return error;
  }

  const isAxios = Boolean(error.isAxiosError || error.response || error.request);
  const status = error.response?.status || (isAxios && !error.response ? 0 : 500);
  const data = error.response?.data;

  // Extract raw backend message
  const rawMsg = data?.message || data?.error || error.message;
  const sanitizedMsg =
    status === 0
      ? "Network error. Please check your internet connection."
      : sanitizeErrorMessage(rawMsg, status);

  let code = "UNKNOWN_ERROR";
  if (status === 0) code = "NETWORK_ERROR";
  else if (status === 400) code = "BAD_REQUEST";
  else if (status === 401) code = "UNAUTHORIZED";
  else if (status === 403) code = "FORBIDDEN";
  else if (status === 404) code = "NOT_FOUND";
  else if (status === 409) code = "CONFLICT";
  else if (status === 422) code = "UNPROCESSABLE_ENTITY";
  else if (status === 429) code = "RATE_LIMITED";
  else if (status >= 500) code = "SERVER_ERROR";

  return new ApiError({
    message: sanitizedMsg,
    status,
    code,
    details: data?.errors || data?.details || null,
    raw: error,
  });
}
