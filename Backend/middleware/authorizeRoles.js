import ApiError from "../utils/ApiError.js";

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access forbidden: Role '${req.user?.role || "unauthenticated"}' is not authorized to perform this action`
        )
      );
    }
    next();
  };
};

export default authorizeRoles;
