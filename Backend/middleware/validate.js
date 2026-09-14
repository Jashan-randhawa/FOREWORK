import ApiError from "../utils/ApiError.js";

export const validate = (schema, source = "body") => {
  return async (req, res, next) => {
    try {
      const dataToValidate = req[source] || {};
      const validatedData = await schema.validateAsync(dataToValidate, {
        abortEarly: false,
        stripUnknown: true,
      });
      req[source] = validatedData;
      next();
    } catch (err) {
      const details = err.details
        ? err.details.map((d) => ({
            field: d.path.join("."),
            message: d.message.replace(/['"]/g, ""),
          }))
        : [];
      const errorMessage = details.length > 0 ? details.map((d) => d.message).join(", ") : err.message;
      next(new ApiError(400, errorMessage, details));
    }
  };
};

export default validate;
