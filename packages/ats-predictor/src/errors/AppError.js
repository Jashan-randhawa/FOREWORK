export class ATSError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "ATSError";
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ATSError;
